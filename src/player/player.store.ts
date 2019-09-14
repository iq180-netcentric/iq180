import { Injectable } from '@nestjs/common';
import { StoreService } from '../store/store.service';
import { Map } from 'immutable';
import { Player } from '../models/player';
import { Action } from '../store/store.type';
import { WebSocketEvent } from '../event/event.type';
import { filter } from 'rxjs/operators';
import { ACTION, PlayerAction } from './player.action';

export type PlayerMap = Map<string, Player>;

export const players = (
    state: PlayerMap = Map(),
    action: PlayerAction,
): PlayerMap => {
    switch (action.type) {
        case ACTION.ADD: {
            const { payload } = action;
            return state.has(payload.id)
                ? state
                : state.set(payload.id, payload);
        }
        case ACTION.REMOVE: {
            const { payload } = action;
            return state.delete(payload);
        }
        case ACTION.EDIT: {
            const { payload } = action;
            return state.set(payload.id, payload);
        }
        default:
            return state;
    }
};

export const isInRoom = <T = any>() =>
    filter<[WebSocketEvent<T>, PlayerMap]>(([{ client }, players]) =>
        players.has(client.id),
    );

@Injectable()
export class PlayerStore {
    constructor(private readonly storeService: StoreService) {}

    readonly store$ = this.storeService.select('players');

    dispatch = (i: Action) => this.storeService.dispatch(i);
}
