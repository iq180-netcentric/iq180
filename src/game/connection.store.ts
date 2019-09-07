import { Injectable } from '@nestjs/common';
import { Client, Action } from '../types';
import { map } from 'rxjs/operators';
import { StoreService } from '../store/store.service';
import { Set } from 'immutable';

export const enum ACTION {
    JOIN = 'JOIN',
    LEAVE = 'LEAVE',
}

export const connectionReducer = (
    state: Set<Client> = Set(),
    { type, payload }: Action<ACTION, Client>,
) => {
    switch (type) {
        case ACTION.JOIN:
            if (state.has(payload)) return state;
            return state.add(payload);
        case ACTION.LEAVE:
            if (!state.has(payload)) return state;
            return state.delete(payload);
        default:
            return state;
    }
};

@Injectable()
export class ConnectionStore {
    constructor(private readonly storeService: StoreService) {}
    private readonly store$ = this.storeService.select('connections');
    connectedClient$ = this.store$.pipe(map(c => Array.from(c)));

    addClient(client: Client) {
        this.storeService.dispatch({ type: ACTION.JOIN, payload: client });
    }
    removeClient(client: Client) {
        this.storeService.dispatch({ type: ACTION.LEAVE, payload: client });
    }
}
