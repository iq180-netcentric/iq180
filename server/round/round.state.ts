import { Machine, assign, sendParent, send, actions } from 'xstate';
import { validateForSubmission, generate } from 'iq180-logic';
import { Round } from '../models/round';
import { addSeconds } from './round.utils';

export const enum RoundState {
    START_ROUND = 'START_ROUND',
    NEW_TURN = 'NEW_TURN',
    START_TURN = 'START_TURN',
    END_TURN = 'END_TURN',
    END_ROUND = 'END_ROUND',
}

interface RoundStateSchema {
    states: {
        [RoundState.START_ROUND]: {};
        [RoundState.NEW_TURN]: {};
        [RoundState.START_TURN]: {};
        [RoundState.END_TURN]: {};
        [RoundState.END_ROUND]: {};
    };
}
interface RoundHistory {
    player: string;
    time?: number;
}
export interface RoundContext extends Round {
    players: string[];
    history: RoundHistory[];
    currentPlayer: string;
    winner: string;
    startTime: Date;
    time?: number
}

export const enum RoundEventType {
    START_ROUND = 'START_ROUND',
    ATTEMPT = 'ATTEMPT',
    TIME_OUT = 'TIME_OUT',
    START_TURN = 'START_TURN',
    END_TURN = 'END_TURN',
    END_ROUND = 'END_ROUND',
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
export interface Attempt {
    type: RoundEventType.ATTEMPT;
    payload: {
        answer: (string | number)[];
        player: string;
    };
}

export interface StartTurn {
    type: RoundEventType.START_TURN;
    payload: {
        currentPlayer: string;
        question: number[];
        operators: string[];
        solution: any[];
        expectedAnswer: number;
    };
}
export interface EndTurn {
    type: RoundEventType.END_TURN;
    payload?: number
}
export interface TimeOut {
    type: RoundEventType.TIME_OUT;
}
export interface EndRound {
    type: RoundEventType.END_ROUND;
    payload: string;
}
export type RoundEvent =
    | StartRound
    | TimeOut
    | Attempt
    | StartTurn
    | EndTurn
    | EndRound;

export const enum RoundActions {
    GENERATE_QUESTION = 'GENERATE_QUESTION',
    CHOOSE_PLAYER = 'CHOOSE_PLAYER',
    START_ROUND = 'START_ROUND',
    START_TURN = 'START_TURN',
    SET_START_TIME = 'SET_START_TIME',
    TIME_OUT = 'TIME_OUT',
    CANCEL_TIMER = 'CANCEL_TIMER',
    ATTEMPT = 'ATTEMPT',
    WRONG = 'WRONG',
    CORRECT = 'CORRECT',
    END_TURN = 'END_TURN',
    FIND_WINNER = ' FIND_WINNER',
    END_ROUND = 'END_ROUND',
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
                entry: [
                    RoundActions.GENERATE_QUESTION,
                    RoundActions.START_ROUND,
                ],
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
                entry: [
                    RoundActions.SET_START_TIME,
                    RoundActions.START_TURN,
                    RoundActions.TIME_OUT,
                ],
                on: {
                    [RoundEventType.TIME_OUT]: {
                        target: RoundState.END_TURN,
                        actions: RoundActions.WRONG,
                    },
                    [RoundEventType.ATTEMPT]: {
                        target: RoundState.END_TURN,
                        actions: [
                            RoundActions.CANCEL_TIMER,
                            RoundActions.CORRECT,
                        ],
                        cond: RoundCond.CORRECT_ANSWER,
                    },
                },
            },
            [RoundState.END_TURN]: {
                entry: [RoundActions.END_TURN],
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
                entry: [RoundActions.FIND_WINNER, RoundActions.END_ROUND],
            },
        },
    },
    {
        actions: {
            [RoundActions.GENERATE_QUESTION]: assign(() => ({
                ...generate()
                // question: [3, 4, 5, 8, 9],
                // operators: ['+', '-', '*', '/'],
                // expectedAnswer: -517,
                // solution: [3, '-', '(', 9, '+', 4, ')', '*', 8, '*', 5],
            })),
            [RoundActions.START_ROUND]: sendParent(RoundEventType.START_ROUND),
            [RoundActions.CHOOSE_PLAYER]: assign<RoundContext>({
                currentPlayer: ({ currentPlayer = '', players = [] }) => {
                    const index = players.indexOf(currentPlayer);
                    return players[index + 1];
                },
            }),
            [RoundActions.START_TURN]: sendParent(
                ({
                    currentPlayer,
                    question,
                    operators,
                    expectedAnswer,
                    solution,
                }) => ({
                    type: RoundEventType.START_TURN,
                    payload: {
                        currentPlayer,
                        question,
                        operators,
                        expectedAnswer,
                        solution,
                    },
                }),
            ),
            [RoundActions.SET_START_TIME]: assign<RoundContext>({
                startTime: () => addSeconds(new Date(), 5),
            }),
            [RoundActions.TIME_OUT]: actions.send(
                { type: RoundEventType.TIME_OUT },
                { delay: 65000, id: 'timer' },
            ),
            [RoundActions.CANCEL_TIMER]: actions.cancel('timer'),
            [RoundActions.CORRECT]: assign<RoundContext>({
                history: ({ currentPlayer, history = [], startTime }) => {
                    const now = new Date();
                    const time = now.valueOf() - startTime.valueOf();
                    const result = [
                        ...history,
                        { player: currentPlayer, time },
                    ];
                    return result;
                },
                time: ({ startTime }) => {
                    const now = new Date();
                    const time = now.valueOf() - startTime.valueOf();
                    return time
                }
            }),
            [RoundActions.WRONG]: assign<RoundContext>({
                history: ({ currentPlayer, history = [] }) => {
                    return [...history, { player: currentPlayer }];
                },
            }),
            [RoundActions.END_TURN]: sendParent((ctx): EndTurn => ({
                type: RoundEventType.END_TURN,
                payload: ctx.time
            })),
            [RoundActions.FIND_WINNER]: assign<RoundContext>({
                winner: ({ history }) =>
                    history
                        .filter(({ time }) => time)
                        .reduce(
                            (prev, cur) => (cur.time < prev.time ? cur : prev),
                            { player: null, time: 9999999 },
                        ).player,
            }),
            [RoundActions.END_ROUND]: sendParent(
                (ctx): EndRound => ({
                    type: RoundEventType.END_ROUND,
                    payload: ctx.winner,
                }),
            ),
        },
        guards: {
            [RoundCond.CORRECT_ANSWER]: (
                { expectedAnswer, question, operators, currentPlayer },
                { payload: { answer, player } }: Attempt,
            ) => {
                const correct = validateForSubmission({
                    array: answer,
                    expectedAnswer,
                    question,
                    operators,
                });
                return correct && player == currentPlayer;
            },
            [RoundCond.FINISHED]: ({ history = [], players = [] }) =>
                history.length === players.length,
            [RoundCond.NOT_FINISHED]: context => {
                const { history = [], players = [] } = context;
                return history.length < players.length;
            },
        },
    },
);
