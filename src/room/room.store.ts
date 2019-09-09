import { Injectable } from '@nestjs/common';
import { SocketClient, Action } from '../types';
import { StoreService } from '../store/store.service';
import { Set } from 'immutable';
import { PlayerInfo, Player } from '../models/player';

export const enum ACTION {
    JOIN = 'JOIN',
    LEAVE = 'LEAVE',
    EDIT = 'EDIT',
}

export const room = (
    state: Set<Player> = Set(),
    { type, payload }: Action<ACTION, Player>,
) => {
    switch (type) {
        case ACTION.JOIN:
            return state.add(payload);
        case ACTION.LEAVE:
            return state.delete(payload);
        default:
            return state;
    }
};

@Injectable()
export class RoomStore {
    constructor(private readonly storeService: StoreService) {}

    readonly store$ = this.storeService.select('room');

    addPlayer(client: Player) {
        this.storeService.dispatch({ type: ACTION.JOIN, payload: client });
    }
    removePlayer(client: Player) {
        this.storeService.dispatch({ type: ACTION.LEAVE, payload: client });
    }
}
