import { Injectable } from '@nestjs/common';
import { Client, Action } from '../types';
import { map } from 'rxjs/operators';
import { StoreService } from '../store/store.service';

export const enum ACTION {
    JOIN = 'JOIN',
    LEAVE = 'LEAVE',
}

export const connectionsReducer = (
    state: Set<Client>,
    { type, payload }: Action<ACTION>,
) => {
    const cloned = new Set(state);
    switch (type) {
        case ACTION.JOIN:
            cloned.add(payload);
            return cloned;
        case ACTION.LEAVE:
            cloned.delete(payload);
            return cloned;
        default:
            return cloned;
    }
};

@Injectable()
export class ConnectionStore {
    constructor(private readonly storeService: StoreService) {}
    private readonly store$ = this.storeService.select('connections');
    connectedClient$ = this.store$.pipe(
        map(clients => [...clients].map(client => client.name)),
    );
    addClient(client: Client) {
        this.storeService.dispatch({ type: ACTION.JOIN, payload: client });
    }
    removeClient(client: Client) {
        this.storeService.dispatch({ type: ACTION.LEAVE, payload: client });
    }
}
