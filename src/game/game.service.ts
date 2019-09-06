import { Injectable } from '@nestjs/common';
import { Client, Store } from '../types';
import { scan } from 'rxjs/operators';
@Injectable()
export class GameService extends Store {
    readonly store$ = this.action$.pipe(
        scan((current, { type, payload }) => {
            switch (type) {
                case 'JOIN':
                    current.add(payload);
                    return current;
                case 'LEAVE':
                    current.delete(payload);
                    return current;
                default:
                    return new Set();
            }
        }, new Set<Client>()),
    );

    addClient(client: Client) {
        this.dispatch({ type: 'JOIN', payload: client });
    }

    removeClient(client: Client) {
        this.dispatch({ type: 'LEAVE', payload: client });
    }
}
