import { createAction } from '../store/store.service';
import { GamePlayerMap, Attempt } from '../models/game';
import { ActionType } from '../store/store.type';

export const enum GAME_ACTION {
    READY = 'READY',
    START = 'START',
    ATTEMPT = 'ATTEMPT',
}

export const readyAction = createAction<GAME_ACTION.READY, boolean>(
    GAME_ACTION.READY,
);
export const startAction = createAction<GAME_ACTION.START, GamePlayerMap>(
    GAME_ACTION.START,
);

export const attemptAction = createAction<GAME_ACTION.ATTEMPT, Attempt>(
    GAME_ACTION.ATTEMPT,
);

export type ReadyAction = ActionType<typeof readyAction>;
export type StartAction = ActionType<typeof startAction>;
export type AttemptAction = ActionType<typeof attemptAction>;

export type GameAction = ReadyAction | StartAction | AttemptAction;
