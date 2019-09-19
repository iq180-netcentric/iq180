import { Injectable } from '@nestjs/common';
import { Game } from '../models/game';
import { Action, Reducer } from '../store/store.type';
import { StoreService } from '../store/store.service';
import { GameAction, GAME_ACTION } from './game.action';
import { gameLens, initialState } from './game.model';

export const game: Reducer<Game, GameAction> = (
    state = initialState,
    action,
) => {
    switch (action.type) {
        case GAME_ACTION.READY: {
            const { payload } = action;
            return gameLens(['ready']).set(payload)(state);
        }
        case GAME_ACTION.START: {
            const { payload } = action;
            return gameLens(['players']).set(payload)(state);
        }
        default:
            return state;
    }
};

@Injectable()
export class GameStore {
    constructor(private readonly storeService: StoreService) {}
    store$ = this.storeService.select('game');
    dispatch = (i: Action) => this.storeService.dispatch(i);
}