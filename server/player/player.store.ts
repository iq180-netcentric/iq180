import { Injectable } from '@nestjs/common';
import { StoreService } from '../store/store.service';
import { Map } from 'immutable';
import { Player } from '../models/player';
import { Action, Reducer } from '../store/store.type';
import { ReceiveEvent } from '../event/event.type';
import { filter } from 'rxjs/operators';
import { PLAYER_ACTION, PlayerAction } from './player.action';

export type PlayerMap = Map<string, Player>;

export const players: Reducer<PlayerMap, PlayerAction> = (
    state = Map(),
    action,
) => {
    switch (action.type) {
        case PLAYER_ACTION.ADD: {
            const { payload } = action;
            return state.has(payload.id)
                ? state
                : state.set(payload.id, payload);
        }
        case PLAYER_ACTION.REMOVE: {
            const { payload } = action;
            return state.delete(payload);
        }
        case PLAYER_ACTION.EDIT: {
            const { payload } = action;
            return state.set(payload.id, payload);
        }
        case PLAYER_ACTION.RESET: {
            return state.map(player => ({ ...player, ready: false }));
        }
        default:
            return state;
    }
};

export const isInRoom = <T = any>() =>
    filter<[ReceiveEvent<T>, PlayerMap]>(([{ client }, players]) =>
        players.has(client.id),
    );

@Injectable()
export class PlayerStore {
    constructor(private readonly storeService: StoreService) {}

    readonly store$ = this.storeService.select('players');

    dispatch = (i: Action) => this.storeService.dispatch(i);
}
