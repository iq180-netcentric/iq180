import { GamePlayerMap } from '../models/game';
import { Machine, assign, send } from 'xstate';
import { Map } from 'immutable';
import {
    roundMachine,
    RoundEventType,
    RoundEvent,
    StartTurn,
} from '../round/round.state';
import { generate } from 'iq180-logic';

export const enum GameState {
    WATING = 'WAITING',
    READY = 'READY',
    PLAYING = 'PLAYING',
}

interface GameStateSchema {
    states: {
        [GameState.WATING]: {};
        [GameState.READY]: {};
        [GameState.PLAYING]: {
            states: {
                ROUND_START: {};
                ROUND_END: {};
                GAME_END: {};
            };
        };
    };
}

export interface GameContext {
    players: GamePlayerMap;
    rounds: number;
    roundNumber: number;
    winner?: string;
    round?: {
        currentPlayer: string;
        question: number[];
        operators: string[];
        expectedAnswer: number;
        solution: (string | number)[];
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

const initialContext = {
    players: Map() as GamePlayerMap,
    rounds: 3,
    roundNumber: 0,
    winner: null,
};

export const gameMachine = Machine<GameContext, GameStateSchema, GameEvent>(
    {
        initial: GameState.WATING,
        context: initialContext,
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
                    [GameEventType.END]: {
                        target: GameState.WATING,
                        actions: 'RESET_STATE',
                    },
                    [RoundEventType.START_TURN]: {
                        actions: 'START_TURN',
                    },
                },
                initial: 'ROUND_START',
                states: {
                    GAME_END: {},
                    ROUND_START: {
                        entry: 'GENERATE_QUESTION',
                        invoke: {
                            id: 'round',
                            src: roundMachine,
                            data: (ctx: GameContext) => {
                                const getPlayers = () => {
                                    const players = ctx.players
                                        .map(p => p.id)
                                        .toIndexedSeq()
                                        .toArray();
                                    const { winner } = ctx;
                                    if (!winner) return players;
                                    else {
                                        const { id } = ctx.players.get(winner);
                                        const rest = players.filter(
                                            p => p !== winner,
                                        );
                                        return [id, ...rest];
                                    }
                                };
                                return {
                                    players: getPlayers(),
                                    ...ctx.round,
                                };
                            },
                            onDone: {
                                target: 'ROUND_END',
                                actions: ['UPDATE_SCORE', 'UPDATE_ROUND'],
                            },
                        },
                    },
                    ROUND_END: {
                        on: {
                            '': [
                                {
                                    target: 'ROUND_START',
                                    cond: 'NOT_FINISHED',
                                },
                                {
                                    target: 'GAME_END',
                                    cond: 'FINISHED',
                                    actions: send({
                                        type: GameEventType.END,
                                    }),
                                },
                            ],
                        },
                    },
                },
            },
        },
    },
    {
        actions: {
            START_TURN: assign<GameContext>({
                round: ({ round }, { payload }: StartTurn) => {
                    return {
                        ...round,
                        ...payload,
                    };
                },
            }),
            UPDATE_SCORE: assign<GameContext>({
                players: ({ players }, { data: { winner } }) => {
                    console.log(winner);
                    return winner
                        ? players.update(winner, player => ({
                              ...player,
                              score: player.score + 1,
                          }))
                        : players;
                },
                winner: (_, { data: { winner } }) => winner,
                round: undefined,
            }),
            UPDATE_ROUND: assign<GameContext>({
                roundNumber: ctx => ctx.roundNumber + 1,
            }),
            GENERATE_QUESTION: assign<GameContext>({
                round: ctx => ({
                    ...ctx.round,
                    // ...generate(),
                    question: [5, 4, 9, 4, 5],
                    operators: ['+', '-', '*', '/'],
                    expectedAnswer: 1,
                    solution: ['(', 5, '-', 4, '*', 9, '/', 4, ')', '+', 5],
                }),
            }),
            RESET_STATE: assign(initialContext),
        },
        guards: {
            FINISHED: ctx => ctx.roundNumber === ctx.rounds,
            NOT_FINISHED: ctx => ctx.roundNumber < ctx.rounds,
        },
    },
);
