import { Injectable, Inject } from '@nestjs/common';
import { Store } from 'redux';
import { AppState } from './store';
import { BehaviorSubject } from 'rxjs';
import { pluck } from 'rxjs/operators';
import { Action } from './store.type';

type Slices = keyof AppState;

export const createAction = <T = any>(type: string) => (payload: T) => ({
    type,
    payload,
});

@Injectable()
export class StoreService {
    store$ = new BehaviorSubject<AppState>(undefined);
    select(slice: Slices) {
        return this.store$.pipe(pluck(slice));
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
            if (oldState !== newState) {
                store$.next(newState);
            }
        });
    }
    dispatch(action: Action) {
        this.store.dispatch(action);
    }
}
