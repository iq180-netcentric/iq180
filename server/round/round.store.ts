import { Reducer, Action } from '../store/store.type';
import { Round } from '../models/round';
import { RoundAction, ROUND_ACTION } from './round.action';
import { Injectable } from '@nestjs/common';
import { StoreService } from '../store/store.service';
import { Option, none, some } from 'fp-ts/lib/Option';

export const round: Reducer<Option<Round>, RoundAction> = (
    state = none,
    action,
) => {
    switch (action.type) {
        case ROUND_ACTION.NEW_QUESTION: {
            const { payload } = action;
            return some(payload);
        }
        default:
            return state;
    }
};

@Injectable()
export class RoundStore {
    constructor(private readonly store: StoreService) {}
    readonly store$ = this.store.select('round');
    dispatch = (i: Action) => this.store.dispatch(i);
}
