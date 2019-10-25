import { GamePlayerMap } from '../models/game';
import { Machine, assign, send, spawn } from 'xstate';
import { Map } from 'immutable';
import {
    roundMachine,
    RoundEventType,
    RoundEvent,
    RoundContext,
    EndRound,
} from '../round/round.state';
import { Actor } from 'xstate/lib/Actor';

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
    totalRounds: number;
    round: number;
    winner?: string;
    roundActor: Actor<RoundContext, RoundEvent>;
}
export const enum GameEventType {
    READY = 'READY',
    NOT_READY = 'NOT_READY',
    START = 'START',
    END = 'END',
}
export interface GameReady {
    type: GameEventType.READY;
}
export interface GameNotReady {
    type: GameEventType.NOT_READY;
}
export interface GameStart {
    type: GameEventType.START;
    payload: GamePlayerMap;
}
export interface GameEnd {
    type: GameEventType.END;
}
export type GameEvent =
    | GameReady
    | GameNotReady
    | GameStart
    | GameEnd
    | RoundEvent;

const initialContext: GameContext = {
    players: Map(),
    totalRounds: 3,
    round: 1,
    roundActor: null,
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
                        actions: ['RESET_STATE', 'ADD_PLAYER'],
                    },
                    [GameEventType.NOT_READY]: GameState.WATING,
                },
            },
            [GameState.PLAYING]: {
                on: {
                    [GameEventType.END]: {
                        target: GameState.WATING,
                        actions: ['STOP_ROUND'],
                    },
                    [RoundEventType.END_ROUND]: {
                        target: 'PLAYING.ROUND_END',
                        actions: ['UPDATE_SCORE', 'UPDATE_ROUND', 'STOP_ROUND'],
                    },
                },
                initial: 'ROUND_START',
                states: {
                    GAME_END: {},
                    ROUND_START: {
                        entry: ['START_ROUND'],
                        on: {
                            [RoundEventType.ATTEMPT]: {
                                actions: send((_, event) => event, {
                                    to: ctx => ctx.roundActor,
                                }),
                            },
                            [RoundEventType.SKIP]: {
                                actions: send((_, event) => event, {
                                    to: ctx => ctx.roundActor,
                                }),
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
            ADD_PLAYER: assign({
                players: (_, event: GameStart) => event.payload,
            }),
            START_ROUND: assign<GameContext>({
                roundActor: ctx => {
                    const getPlayers = () => {
                        function shuffle(array) {
                            array.sort(() => Math.random() - 0.5);
                        }
                        const players = ctx.players
                            .map(p => p.id)
                            .toIndexedSeq()
                            .toArray();
                        shuffle(players)
                        const { winner } = ctx;
                        if (!winner) {
                            return players;
                        } else {
                            const rest = players.filter(p => p !== winner);
                            return [winner, ...rest];
                        }
                    };
                    const context = {
                        players: getPlayers(),
                    };
                    return spawn(roundMachine.withContext(context as any));
                },
            }),
            UPDATE_SCORE: assign<GameContext>({
                players: ({ players }, { payload }: EndRound) => {
                    return payload
                        ? players.update(payload, player => ({
                            ...player,
                            score: player.score + 1,
                        }))
                        : players;
                },
                winner: (_, { payload }) => payload,
            }),
            UPDATE_ROUND: assign<GameContext>({
                round: ctx => ctx.round + 1,
            }),
            RESET_STATE: assign(initialContext),
            STOP_ROUND: assign<GameContext>({
                roundActor: ({ roundActor }) => {
                    roundActor && roundActor.stop();
                    return null;
                },
            }),
        },
        guards: {
            FINISHED: ctx => ctx.round > ctx.totalRounds,
            NOT_FINISHED: ctx => {
                return ctx.round < ctx.totalRounds + 1;
            },
        },
    },
);
