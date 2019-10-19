import { Machine, assign, sendParent } from 'xstate';
import { generate, validateForSubmission } from 'iq180-logic';
import { addSeconds } from './round.utils';

export const enum RoundState {
    START_ROUND = 'START_ROUND',
    NEW_TURN = 'NEW_TURN',
    START_TURN = 'START_TURN',
    TIME_OUT = 'TIME_OUT',
    CORRECT = 'CORRECT',
    END_TURN = 'END_TURN',
    END_ROUND = 'END_ROUND',
}

interface RoundStateSchema {
    states: {
        [RoundState.START_ROUND]: {};
        [RoundState.NEW_TURN]: {};
        [RoundState.START_TURN]: {};
        [RoundState.TIME_OUT]: {};
        [RoundState.CORRECT]: {};
        [RoundState.END_TURN]: {};
        [RoundState.END_ROUND]: {};
    };
}
interface RoundHistory {
    player: string;
    time?: number;
}
export interface RoundContext {
    players: string[];
    history: RoundHistory[];
    turn: number;
    currentPlayer: string;
    winner: string;
    question: number[];
    operators: string[];
    expectedAnswer: number;
    solution: (string | number)[];
    startTime: Date;
}
export const enum RoundEventType {
    START_ROUND = 'START_ROUND',
    ANSWER = 'ANSWER',
    START_TURN = 'START_TURN',
    END_TURN = 'END_TURN',
}
export interface StartRound {
    type: RoundEventType.START_ROUND;
    payload: {
        question: number[];
        operators: string[];
        expectedAnswer: number;
        solution: (string | number)[];
    };
}
export interface Answer {
    type: RoundEventType.ANSWER;
    payload: (string | number)[];
}

export interface StartTurn {
    type: RoundEventType.START_TURN;
    payload: {
        player: string;
        startTime: Date;
    };
}
export interface EndTurn {
    type: RoundEventType.END_TURN;
}
export type RoundEvent = Answer | StartTurn | EndTurn;

export const enum RoundActions {
    GENERATE_QUESTION = 'GENERATE_QUESTION',
    CHOOSE_PLAYER = 'CHOOSE_PLAYER',
    START_ROUND = 'START_ROUND',
    START_TURN = 'START_TURN',
    WRONG = 'WRONG',
    CORRECT = 'CORRECT',
    END_TURN = 'END_TURN',
    FIND_WINNER = ' FIND_WINNER',
}

export const enum RoundCond {
    CORRECT_ANSWER = 'CORRECT_ANSWER',
    FINISHED = 'FINISHED',
    NOT_FINISHED = 'NOT_FINISHED',
}

export const roundMachine = Machine<RoundContext, RoundStateSchema, RoundEvent>(
    {
        initial: RoundState.START_ROUND,
        states: {
            [RoundState.START_ROUND]: {
                entry: RoundActions.GENERATE_QUESTION,
                on: {
                    '': RoundState.NEW_TURN,
                },
            },
            [RoundState.NEW_TURN]: {
                entry: RoundActions.CHOOSE_PLAYER,
                on: {
                    '': RoundState.START_TURN,
                },
            },
            [RoundState.START_TURN]: {
                entry: RoundActions.START_TURN,
                after: {
                    6500: RoundState.END_TURN,
                },
                on: {
                    [RoundEventType.ANSWER]: {
                        target: RoundState.END_TURN,
                        cond: RoundCond.CORRECT_ANSWER,
                    },
                },
            },
            [RoundState.TIME_OUT]: {
                entry: RoundActions.WRONG,
                on: {
                    '': RoundState.END_TURN,
                },
            },
            [RoundState.CORRECT]: {
                entry: RoundActions.CORRECT,
                on: {
                    '': RoundState.END_TURN,
                },
            },
            [RoundState.END_TURN]: {
                entry: RoundActions.END_TURN,
                on: {
                    '': [
                        {
                            target: RoundState.NEW_TURN,
                            cond: RoundCond.NOT_FINISHED,
                        },
                        {
                            target: RoundState.END_ROUND,
                            cond: RoundCond.FINISHED,
                        },
                    ],
                },
            },
            [RoundState.END_ROUND]: {
                type: 'final',
                data: {
                    winner: (context: RoundContext) => context.winner,
                },
            },
        },
    },
    {
        actions: {
            [RoundActions.GENERATE_QUESTION]: assign<RoundContext>({
                ...generate(),
                startTime: addSeconds(new Date(), 5),
            }),
            [RoundActions.CHOOSE_PLAYER]: assign<RoundContext>({
                currentPlayer: ({ currentPlayer, players }) => {
                    const index = players.findIndex(
                        player => player === currentPlayer,
                    );
                    return players[index + 1];
                },
            }),
            [RoundActions.START_TURN]: sendParent(
                ({ currentPlayer, startTime }) => ({
                    type: RoundEventType.START_TURN,
                    payload: { player: currentPlayer, startTime },
                }),
            ),
            [RoundActions.CORRECT]: assign<RoundContext>({
                history: ({ currentPlayer, history, startTime }) => {
                    const now = new Date();
                    const time = now.valueOf() - startTime.valueOf();
                    return [...history, { player: currentPlayer, time }];
                },
            }),
            [RoundActions.WRONG]: assign<RoundContext>({
                history: ({ currentPlayer, history }) => {
                    return [...history, { player: currentPlayer }];
                },
            }),
            [RoundActions.END_TURN]: sendParent(({ currentPlayer }) => ({
                type: RoundEventType.END_TURN,
                payload: currentPlayer,
            })),
            [RoundActions.FIND_WINNER]: assign<RoundContext>({
                winner: ({ history }) =>
                    history
                        .filter(({ time }) => time)
                        .reduce((prev, cur) =>
                            cur.time < prev.time ? cur : prev,
                        ).player,
            }),
        },
        guards: {
            [RoundCond.CORRECT_ANSWER]: (
                { expectedAnswer, question, operators },
                event: Answer,
            ) =>
                validateForSubmission({
                    array: event.payload,
                    expectedAnswer,
                    question,
                    operators,
                }),
            [RoundCond.FINISHED]: ({ history, players }) =>
                history.length === players.length,
            [RoundCond.NOT_FINISHED]: ({ history, players }) =>
                history.length < players.length,
        },
    },
);
