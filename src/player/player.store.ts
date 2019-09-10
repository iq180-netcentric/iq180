import { Injectable } from '@nestjs/common';
import { SocketClient, Action } from '../types';
import { StoreService } from '../store/store.service';
import { Set } from 'immutable';
import { Player } from '../models/player';
import { EditEvent } from '../event/in-events';

export const enum ACTION {
    JOIN = 'JOIN',
    LEAVE = 'LEAVE',
    EDIT = 'EDIT',
}

export const players = (
    state: Set<Player> = Set(),
    { type, payload }: Action<ACTION, Player>,
): Set<Player> => {
    switch (type) {
        case ACTION.JOIN:
            return state.some(players => players.client == payload.client)
                ? state
                : state.add(payload);
        case ACTION.LEAVE:
            return state.delete(payload);
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

@Injectable()
export class PlayerStore {
    constructor(private readonly storeService: StoreService) {}

    readonly store$ = this.storeService.select('players');

    addPlayer(client: Player) {
        this.storeService.dispatch({ type: ACTION.JOIN, payload: client });
    }
    removePlayer(client: Player) {
        this.storeService.dispatch({ type: ACTION.LEAVE, payload: client });
    }
    editPlayer(input: Player) {
        this.storeService.dispatch({ type: ACTION.EDIT, payload: input });
    }
}
