import { Injectable } from '@nestjs/common';
import { Client, Action } from '../types';
import { scan, map, filter, tap } from 'rxjs/operators';
import { Store } from '../common/Store';

export enum ACTION {
    JOIN,
    LEAVE,
}

export const reducer = (
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
export class ConnectionStore extends Store<ACTION> {
    private readonly store$ = this.action$.pipe(
        scan(reducer, new Set<Client>()),
    );

    connectedClient$ = this.store$.pipe(
        map(clients => [...clients].map(client => client.name)),
    );

    addClient(client: Client) {
        this.dispatch({ type: ACTION.JOIN, payload: client });
    }

    removeClient(client: Client) {
        this.dispatch({ type: ACTION.LEAVE, payload: client });
    }
}
