import { createAction } from '../store/store.service';
import { GamePlayerMap, Attempt } from '../models/game';
import { ActionType } from '../store/store.type';

export const enum GAME_ACTION {
    READY = 'READY',
    NEW_QUESTION = 'NEW_QUESTION',
    START = 'START',
    ATTEMPT = 'ATTEMPT',
}

export interface NewQuestionPayload {
    startTime: string;
    question: number[];
    expectedAnswer: number;
}

export const readyAction = createAction<GAME_ACTION.READY, boolean>(
    GAME_ACTION.READY,
);
export const startAction = createAction<GAME_ACTION.START, GamePlayerMap>(
    GAME_ACTION.START,
);
export const newQuestionAction = createAction<
    GAME_ACTION.NEW_QUESTION,
    NewQuestionPayload
>(GAME_ACTION.NEW_QUESTION);

export const attemptAction = createAction<GAME_ACTION.ATTEMPT, Attempt>(
    GAME_ACTION.ATTEMPT,
);

export type ReadyAction = ActionType<typeof readyAction>;
export type StartAction = ActionType<typeof startAction>;
export type NewQuestionAction = ActionType<typeof newQuestionAction>;
export type AttemptAction = ActionType<typeof attemptAction>;

export type GameAction =
    | ReadyAction
    | StartAction
    | NewQuestionAction
    | AttemptAction;
