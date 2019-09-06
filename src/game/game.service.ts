import { Injectable } from '@nestjs/common';
import { Client, Action } from '../types';
import { scan, map } from 'rxjs/operators';
import { Store } from '../common/Store';

enum ACTION {
    JOIN,
    LEAVE,
}
@Injectable()
export class GameService extends Store<ACTION> {
    private readonly store$ = this.action$.pipe(
        scan((state, { type, payload }) => {
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
        }, new Set<Client>()),
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
