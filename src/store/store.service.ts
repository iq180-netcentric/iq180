import { Injectable, Inject } from '@nestjs/common';
import { Store } from 'redux';
import { AppState, store } from './store';
import { Action } from '../types';
import { BehaviorSubject } from 'rxjs';
import { pluck } from 'rxjs/operators';

type Slices = keyof AppState;
@Injectable()
export class StoreService {
    store$ = new BehaviorSubject<AppState>(undefined);
    select(slice: Slices) {
        return this.store$.pipe(pluck(slice));
    }
    constructor(
        @Inject('STORE') private readonly store: Store<AppState, Action>,
    ) {
        store.subscribe(() => {
            const oldState = this.store$.value;
            const newState = store.getState();
            if (oldState != newState) this.store$.next(newState);
        });
    }
    dispatch(action: Action) {
        this.store.dispatch(action);
    }
}
