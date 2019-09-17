import { Injectable, Inject } from '@nestjs/common';
import { Store } from 'redux';
import { AppState } from './store';
import { BehaviorSubject, Observable } from 'rxjs';
import { pluck, share } from 'rxjs/operators';
import { Action } from './store.type';
import * as equal from 'deep-equal';

export const createAction = <Type = string, Payload = any>(type: Type) => (
    payload: Payload,
): Action<Type, Payload> => ({
    type,
    payload,
});

@Injectable()
export class StoreService {
    store$ = new BehaviorSubject<AppState>(undefined);
    select<T extends keyof AppState>(slice: T): Observable<AppState[T]> {
        return this.store$.pipe(
            pluck(slice),
            share(),
        );
    }
    constructor(
        @Inject('STORE') private readonly store: Store<AppState, Action>,
    ) {
        this.initStore(store, this.store$);
    }
    initStore(
        store: Store<AppState, Action>,
        store$: BehaviorSubject<AppState>,
    ) {
        store$.next(store.getState());
        store.subscribe(() => {
            const oldState = this.store$.value;
            const newState = store.getState();
            if (!equal(oldState, newState)) {
                store$.next(newState);
                // console.log(JSON.stringify(newState.game, null, 2));
            }
        });
    }
    dispatch(action: Action) {
        this.store.dispatch(action);
    }
}
