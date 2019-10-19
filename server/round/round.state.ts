import { Machine, assign, sendParent, send, actions } from 'xstate';
import { validateForSubmission } from 'iq180-logic';

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
export interface RoundContext {
    players: string[];
    history: RoundHistory[];
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
    TIME_OUT = 'TIME_OUT',
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
export interface TimeOut {
    type: RoundEventType.TIME_OUT;
}
export type RoundEvent = StartRound | TimeOut | Answer | StartTurn | EndTurn;

export const enum RoundActions {
    GENERATE_QUESTION = 'GENERATE_QUESTION',
    CHOOSE_PLAYER = 'CHOOSE_PLAYER',
    START_ROUND = 'START_ROUND',
    START_TURN = 'START_TURN',
    TIME_OUT = 'TIME_OUT',
    CANCEL_TIMER = 'CANCEL_TIMER',
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
                entry: RoundActions.START_ROUND,
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
                entry: [RoundActions.START_TURN, RoundActions.TIME_OUT],
                on: {
                    [RoundEventType.TIME_OUT]: {
                        target: RoundState.END_TURN,
                        actions: RoundActions.WRONG,
                    },
                    [RoundEventType.ANSWER]: {
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
                data: {
                    winner: (context: RoundContext) => context.winner,
                },
            },
        },
    },
    {
        actions: {
            [RoundEventType.START_ROUND]: sendParent(
                RoundEventType.START_ROUND,
            ),
            [RoundActions.CHOOSE_PLAYER]: assign<RoundContext>({
                currentPlayer: ({ currentPlayer = '', players = [] }) => {
                    const index = players.indexOf(currentPlayer);
                    return players[index + 1];
                },
            }),
            [RoundActions.START_TURN]: sendParent(
                ({ currentPlayer, startTime }) => ({
                    type: RoundEventType.START_TURN,
                    payload: { player: currentPlayer, startTime },
                }),
            ),
            [RoundActions.TIME_OUT]: actions.send(
                { type: RoundEventType.TIME_OUT },
                { delay: 5000, id: 'timer' },
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
            }),
            [RoundActions.WRONG]: assign<RoundContext>({
                history: ({ currentPlayer, history = [] }) => {
                    return [...history, { player: currentPlayer }];
                },
            }),
            [RoundActions.END_TURN]: sendParent({
                type: RoundEventType.END_TURN,
            }),
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
            ) => {
                const result = validateForSubmission({
                    array: event.payload,
                    expectedAnswer,
                    question,
                    operators,
                });
                return result;
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
