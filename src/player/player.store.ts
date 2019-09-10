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

export interface EditInput {
    client: SocketClient;
    input: EditEvent;
}

export const players = (
    state: Set<Player> = Set(),
    { type, payload }: Action<ACTION>,
) => {
    switch (type) {
        case ACTION.JOIN:
            return state.some(players => players.client == payload.client)
                ? state
                : state.add(payload);
        case ACTION.LEAVE:
            return state.delete(payload);
        case ACTION.EDIT:
            let { input, client } = payload as EditInput;
            return state.map(player => {
                if (player.client === client) {
                    const playerInfo = { ...player.playerInfo, ...input };
                    return { ...player, playerInfo };
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
    editPlayer(input: EditInput) {
        this.storeService.dispatch({ type: ACTION.EDIT, payload: input });
    }
}
