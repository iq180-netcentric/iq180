import { Injectable } from '@nestjs/common';
import { StoreService, createAction } from '../store/store.service';
import { List } from 'immutable';
import { Player } from '../models/player';
import { Action } from '../store/store.type';
import { WebSocketEvent } from '../event/event.type';
import { filter } from 'rxjs/operators';

export const enum ACTION {
    JOIN = 'JOIN',
    LEAVE = 'LEAVE',
    EDIT = 'EDIT',
}

export const players = (
    state: List<Player> = List(),
    { type, payload }: Action<ACTION, Player>,
): List<Player> => {
    switch (type) {
        case ACTION.JOIN:
            return state.some(players => players.client == payload.client)
                ? state
                : state.push(payload);
        case ACTION.LEAVE:
            return state.filter(player => player == payload);
        case ACTION.EDIT:
            return state.map(player => {
                if (player.client === payload.client) {
                    return payload;
                } else return player;
            });
        default:
            return state;
    }
};

export const isInRoom = <T = any>() =>
    filter<[WebSocketEvent<T>, Player[]]>(
        ([{ client }, players]) => !!players.find(p => p.client === client),
    );

export const addPlayerAction = createAction<Player>(ACTION.JOIN);
export const editPlayerAction = createAction<Player>(ACTION.EDIT);
export const removePlayerAction = createAction<Player>(ACTION.LEAVE);

@Injectable()
export class PlayerStore {
    constructor(private readonly storeService: StoreService) {}

    readonly store$ = this.storeService.select('players');

    dispatch = (i: Action) => this.storeService.dispatch(i);
}
