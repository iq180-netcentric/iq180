import { GamePlayerMap } from '../models/game';
import { Machine, assign, send, spawn, actions } from 'xstate';
import { Map } from 'immutable';
import {
    roundMachine,
    RoundEventType,
    RoundEvent,
    StartTurn,
    RoundContext,
    EndRound,
} from '../round/round.state';
import { generate } from 'iq180-logic';
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
    rounds: number;
    roundNumber: number;
    winner?: string;
    roundActor: Actor<RoundContext, RoundEvent>;
    // round?: {
    //     currentPlayer: string;
    //     question: number[];
    //     operators: string[];
    //     expectedAnswer: number;
    //     solution: (string | number)[];
    // };
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
    rounds: 3,
    roundNumber: 0,
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
                    [RoundEventType.ANSWER]: {
                        actions: send((_, event) => event, {
                            to: ctx => ctx.roundActor,
                        }),
                    },
                    [GameEventType.END]: {
                        target: GameState.WATING,
                        actions: ['STOP_ROUND'],
                    },
                    [RoundEventType.START_TURN]: {
                        actions: 'START_TURN',
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
                        entry: ['GENERATE_QUESTION', 'START_ROUND'],
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
                        const players = ctx.players
                            .map(p => p.id)
                            .toIndexedSeq()
                            .toArray();
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
                roundNumber: ctx => ctx.roundNumber + 1,
            }),
            RESET_STATE: assign(initialContext),
            STOP_ROUND: assign<GameContext>({
                roundActor: ({roundActor}) => {
                    roundActor && roundActor.stop();
                    return null;
                },
            }),
        },
        guards: {
            FINISHED: ctx => ctx.roundNumber === ctx.rounds,
            NOT_FINISHED: ctx => ctx.roundNumber < ctx.rounds,
        },
    },
);
