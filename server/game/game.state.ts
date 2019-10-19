import { GamePlayerMap } from '../models/game';
import { Machine, assign, send } from 'xstate';
import { Map } from 'immutable';
import { roundMachine, RoundEventType, RoundEvent } from '../round/round.state';
import { generate } from 'iq180-logic';
import { addSeconds } from '../round/round.utils';

export const enum GameState {
    WATING = 'WAITING',
    READY = 'READY',
    PLAYING = 'PLAYING',
    END = 'END',
}

interface GameStateSchema {
    states: {
        [GameState.WATING]: {};
        [GameState.READY]: {};
        [GameState.PLAYING]: {
            states: {
                ROUND: { states: { IDLE: {}; START: {}; END: {} } };
                TURN: { states: { IDLE: {}; START: {}; END: {} } };
            };
        };
        [GameState.END]: {};
    };
}

export interface GameContext {
    players: GamePlayerMap;
    rounds: number;
    roundNumber: number;
    round?: {
        currentPlayer: string;
        question: number[];
        operators: string[];
        expectedAnswer: number;
        solution: (string | number)[];
        startTime: Date;
    };
}
export const enum GameEventType {
    READY = 'READY',
    NOT_READY = 'NOT_READY',
    START = 'START',
    END = 'END',
}
export type GameReady = { type: GameEventType.READY };
export type GameNotReady = { type: GameEventType.NOT_READY };
export type GameStart = { type: GameEventType.START; payload: GamePlayerMap };
export type GameEnd = { type: GameEventType.END };
export type GameEvent =
    | GameReady
    | GameNotReady
    | GameStart
    | GameEnd
    | RoundEvent;

export const gameMachine = Machine<GameContext, GameStateSchema, GameEvent>(
    {
        initial: GameState.WATING,
        context: {
            players: Map(),
            rounds: 3,
            roundNumber: 0,
        },
        states: {
            [GameState.WATING]: {
                on: {
                    [GameEventType.READY]: GameState.READY,
                },
            },
            [GameState.READY]: {
                on: {
                    [GameEventType.START]: {
                        target: GameState.PLAYING,
                        actions: assign({
                            players: (_, event: GameStart) => event.payload,
                        }),
                    },
                    [GameEventType.NOT_READY]: GameState.WATING,
                },
            },
            [GameState.PLAYING]: {
                on: {
                    [RoundEventType.ANSWER]: {
                        actions: send((_, event) => event, { to: 'round' }),
                    },
                    [RoundEventType.START_ROUND]: {},
                    [GameEventType.END]: {
                        target: GameState.END,
                    },
                },
                type: 'parallel',
                states: {
                    ROUND: {
                        initial: 'START',
                        states: {
                            IDLE: {},
                            START: {
                                invoke: {
                                    id: 'Round',
                                    src: roundMachine,
                                    data: {
                                        players: (ctx: GameContext) =>
                                            ctx.players
                                                .map(player => player.id)
                                                .toIndexedSeq()
                                                .toArray(),
                                        ...generate(),
                                        startTime: addSeconds(new Date(), 5),
                                    },
                                    onDone: {
                                        target: 'END',
                                        actions: [
                                            'UPDATE_SCORE',
                                            'UPDATE_ROUND',
                                        ],
                                    },
                                },
                            },
                            END: {
                                on: {
                                    '': [
                                        {
                                            target: 'START',
                                            cond: 'NOT_FINISHED',
                                        },
                                        {
                                            target: 'IDLE',
                                            cond: 'FINISHED',
                                            actions: send({
                                                type: GameState.END,
                                            }),
                                        },
                                    ],
                                },
                            },
                        },
                    },
                    TURN: {
                        initial: 'IDLE',
                        states: {
                            IDLE: {
                                on: {
                                    [RoundEventType.START_TURN]: {
                                        target: 'START',
                                        actions: 'START_TURN',
                                    },
                                },
                            },
                            START: {
                                on: {
                                    [RoundEventType.END_TURN]: {
                                        target: 'END',
                                    },
                                },
                            },
                            END: {
                                on: {
                                    [RoundEventType.START_TURN]: {
                                        target: 'START',
                                        actions: 'START_TURN',
                                    },
                                },
                            },
                        },
                    },
                },
            },
            [GameState.END]: {
                on: { '': GameState.WATING },
            },
        },
    },
    {
        actions: {
            START_TURN: assign<GameContext>({
                round: ({ round }, event) => {
                    return {
                        ...round,
                        ...event.payload,
                    };
                },
            }),
            UPDATE_SCORE: assign<GameContext>({
                players: ({ players }, { data: winner }) =>
                    winner
                        ? players.update(winner, player => ({
                              ...player,
                              score: player.score + 1,
                          }))
                        : players,
                round: undefined,
            }),
            UPDATE_ROUND: assign<GameContext>({
                roundNumber: ctx => ctx.roundNumber + 1,
            }),
        },
        guards: {
            FINISHED: ctx => ctx.roundNumber === ctx.rounds,
            NOT_FINISHED: ctx => ctx.roundNumber < ctx.rounds,
        },
    },
);
