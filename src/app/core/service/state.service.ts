import { Injectable } from '@angular/core';
import { Machine, interpret, assign, send, State } from 'xstate';
import { fromEventPattern, Observable } from 'rxjs';
import {
    pluck,
    share,
    shareReplay,
    distinctUntilChanged,
    filter,
} from 'rxjs/operators';
import {
    GameEvent,
    gameMachine,
    GameEventType,
    GameContext,
    GameState,
    GameAnswerAttempt,
    GenericGameEvent,
} from 'src/app/home/game-field/game-state.service';
import { GameInfo, GameMode, GameAnswer } from '../models/game/game.model';
import { Player } from '../models/player.model';
import { generate, calculate } from 'iq180-logic';
import { Game } from 'server/models/game';

export const enum AppState {
    IDLE = 'IDLE',
    PLAYING = 'PLAYING',
    READY = 'READY',
}

interface AppStateSchema {
    states: {
        [AppState.IDLE]: {};
        [AppState.PLAYING]: {
            states: {
                [GameState.WAITING]: {};
                [GameState.PLAYING]: {};
                [GameState.WIN]: {};
                [GameState.LOSE]: {};
            };
        };
        [AppState.READY]: {};
    };
}

export interface AppContext {
    players: Player[];
    selectedPlayer?: Player;
    ready: boolean;
    currentGame?: GameInfo;
    question?: number[];
    expectedAnswer?: number;
    timeLeft?: number;
    winner?: Player;
}

export const enum AppEventType {
    READY = 'READY',
    START_GAME = 'START_GAME',
    END_GAME = 'END_GAME',
    SELECT_PLAYER = 'SELECT_PLAYER',
}

export interface AppReady {
    type: AppEventType.READY;
    payload: boolean;
}

export interface AppStart {
    type: AppEventType.START_GAME;
    payload: {
        info: GameInfo;
        players?: Player[];
    };
}

export interface AppEndGame {
    type: AppEventType.END_GAME;
}

export interface AppSelectPlayer {
    type: AppEventType.SELECT_PLAYER;
    payload: Player;
}

export type AppEvent = AppReady | AppStart | AppEndGame | AppSelectPlayer;
@Injectable({
    providedIn: 'root',
})
export class StateService {
    static machine = Machine<AppContext, AppStateSchema, AppEvent | GameEvent>(
        {
            id: 'app',
            initial: AppState.IDLE,
            context: {
                players: [],
                ready: false,
            },
            states: {
                [AppState.IDLE]: {
                    entry: 'UNSET_READY',
                    on: {
                        [AppEventType.READY]: {
                            target: AppState.READY,
                        },
                        [AppEventType.START_GAME]: {
                            target: AppState.PLAYING,
                            actions: ['UNSET_READY', 'SET_GAME'],
                        },
                    },
                },
                [AppState.PLAYING]: {
                    initial: GameState.WAITING,
                    on: {
                        [GameEventType.SKIP]: {
                            target: AppState.PLAYING,
                            actions: 'GENERATE_QUESTION',
                        },
                        [GameEventType.START_ROUND]: {
                            actions: [
                                'SELECT_PLAYER',
                                send((_, evt) => evt, { to: 'game' }),
                            ],
                        },

                        [GameEventType.ATTEMPT]: {
                            actions: [send((_, evt) => evt, { to: 'game' })],
                        },
                        [AppEventType.SELECT_PLAYER]: {
                            actions: ['SELECT_PLAYER'],
                        },
                        [AppEventType.END_GAME]: {
                            target: AppState.IDLE,
                            cond: 'SINGLE_PLAYER',
                            actions: ['CLEAR_GAME'],
                        },
                    },
                    states: {
                        [GameState.WAITING]: {
                            on: {
                                [GameEventType.START_TURN]: [
                                    {
                                        actions: [
                                            assign((ctx, evt) => {
                                                const {
                                                    currentPlayer,
                                                } = evt.payload;
                                                return {
                                                    ...ctx,
                                                    selectedPlayer: currentPlayer,
                                                };
                                            }),
                                            'GENERATE_QUESTION',
                                        ],
                                        cond: 'SINGLE_PLAYER',
                                        target: GameState.PLAYING,
                                    },
                                    {
                                        target: GameState.PLAYING,
                                        cond: (_, evt) =>
                                            evt.payload.question &&
                                            evt.payload.expectedAnswer,
                                        actions: [
                                            assign((ctx, evt) => {
                                                const {
                                                    question,
                                                    expectedAnswer,
                                                    currentPlayer,
                                                } = evt.payload;
                                                return {
                                                    ...ctx,
                                                    question,
                                                    expectedAnswer,
                                                    selectedPlayer: currentPlayer,
                                                };
                                            }),
                                        ],
                                    },
                                    {
                                        actions: [
                                            assign((ctx, evt) => {
                                                const {
                                                    currentPlayer,
                                                } = evt.payload;
                                                return {
                                                    ...ctx,
                                                    selectedPlayer: currentPlayer,
                                                };
                                            }),
                                        ],
                                    },
                                ],
                                [GameEventType.WIN]: {
                                    target: GameState.WIN,
                                    actions: assign<AppContext>({
                                        winner: (_, evt) => evt.payload,
                                    }),
                                },
                                [GameEventType.LOSE]: {
                                    target: GameState.LOSE,
                                    actions: assign<AppContext>({
                                        winner: (_, evt) => {
                                            return evt.payload;
                                        },
                                    }),
                                },
                            },
                        },
                        [GameState.PLAYING]: {
                            on: {
                                [GameEventType.ATTEMPT]: [
                                    {
                                        target: GameState.WIN,
                                        cond: (
                                            ctx,
                                            evt: GenericGameEvent<
                                                GameAnswer & {
                                                    numbersLeft: number;
                                                }
                                            >,
                                        ) => {
                                            const {
                                                answer,
                                                expectedAnswer,
                                                numbersLeft,
                                            } = evt.payload;
                                            return (
                                                calculate(answer) ===
                                                    expectedAnswer &&
                                                ctx.currentGame.mode ===
                                                    GameMode.singlePlayer &&
                                                numbersLeft === 0
                                            );
                                        },
                                    },
                                ],
                                [GameEventType.TIMER]: {
                                    actions: ['SET_TIMER'],
                                },
                                [GameEventType.SKIP]: {
                                    cond: 'SINGLE_PLAYER',
                                    actions: 'GENERATE_QUESTION',
                                },
                                [GameEventType.LOSE]: {
                                    target: GameState.LOSE,
                                },
                                [GameEventType.END_TURN]: {
                                    target: GameState.WAITING,
                                    actions: ['CLEAR_QUESTION', 'CLEAR_PLAYER'],
                                },
                            },
                        },
                        [GameState.WIN]: {
                            on: {
                                [GameEventType.CANCEL_CLICK]: [
                                    {
                                        cond: 'SINGLE_PLAYER',
                                        actions: send(
                                            () => ({
                                                type: GameEventType.EXIT,
                                            }),
                                            { to: 'game' },
                                        ),
                                    },
                                    {
                                        target: GameState.WAITING,
                                    },
                                ],
                                [GameEventType.OK_CLICK]: [
                                    {
                                        target: GameState.PLAYING,
                                        cond: 'SINGLE_PLAYER',
                                        actions: ['GENERATE_QUESTION'],
                                    },
                                    {
                                        target: GameState.WAITING,
                                        actions: ['CLEAR_WINNER'],
                                    },
                                ],
                            },
                            after: {
                                2000: {
                                    target: GameState.WAITING,
                                    actions: ['CLEAR_WINNER'],
                                },
                            },
                        },
                        [GameState.LOSE]: {
                            on: {
                                [GameEventType.CANCEL_CLICK]: [
                                    {
                                        cond: 'SINGLE_PLAYER',
                                        actions: send(
                                            () => ({
                                                type: GameEventType.EXIT,
                                            }),
                                            { to: 'game' },
                                        ),
                                    },
                                    {
                                        target: GameState.WAITING,
                                    },
                                ],
                                [GameEventType.OK_CLICK]: [
                                    {
                                        target: GameState.PLAYING,
                                        cond: 'SINGLE_PLAYER',
                                        actions: ['GENERATE_QUESTION'],
                                    },
                                    {
                                        target: GameState.WAITING,
                                        actions: ['CLEAR_WINNER'],
                                    },
                                ],
                            },
                            after: {
                                2000: {
                                    target: GameState.WAITING,
                                    actions: ['CLEAR_WINNER'],
                                },
                            },
                        },
                    },
                    invoke: {
                        id: 'game',
                        src: gameMachine,
                        data: {
                            game: ctx => ctx.currentGame,
                            question: ctx => ctx.question,
                            expectedAnswer: ctx => ctx.expectedAnswer,
                        },
                        autoForward: true,
                        onDone: {
                            target: 'IDLE',
                            actions: ['CLEAR_GAME'],
                        },
                    },
                },
                [AppState.READY]: {
                    entry: 'SET_READY',
                    on: {
                        [AppEventType.READY]: AppState.IDLE,
                        [AppEventType.START_GAME]: {
                            target: AppState.PLAYING,
                            actions: ['UNSET_READY', 'SET_GAME'],
                        },
                    },
                },
            },
        },
        {
            guards: {
                SINGLE_PLAYER: (ctx, evt) =>
                    ctx.currentGame.mode === GameMode.singlePlayer,
            },
            actions: {
                SET_READY: assign<AppContext>({ ready: () => true }),
                UNSET_READY: assign<AppContext>({ ready: () => false }),
                CLEAR_GAME: assign<AppContext>({
                    selectedPlayer: undefined,
                    currentGame: undefined,
                    question: undefined,
                    expectedAnswer: undefined,
                }),
                SET_GAME: assign<AppContext>({
                    currentGame: (_, evt) => evt.payload.info,
                    players: (_, evt) => evt.payload.players,
                }),
                SELECT_PLAYER: assign<AppContext>({
                    selectedPlayer: (_, evt) => evt.payload,
                }),
                GENERATE_QUESTION: assign<AppContext>((ctx, evt) => {
                    const { question, expectedAnswer } = generate();
                    return {
                        ...ctx,
                        question,
                        expectedAnswer,
                    };
                }),
                SET_TIMER: assign<AppContext>({
                    timeLeft: (_, evt) => evt.payload,
                }),
                CLEAR_QUESION: assign<AppContext>({
                    question: undefined,
                    expectedAnswer: undefined,
                }),
                CLEAR_PLAYER: assign<AppContext>({
                    selectedPlayer: undefined,
                }),
                CLEAR_WINNER: assign<AppContext>({
                    winner: undefined,
                }),
            },
        },
    );

    machine = interpret(StateService.machine);

    constructor() {}

    state$ = fromEventPattern<State<AppContext, AppEvent | GameEvent>>(
        handler => {
            this.machine
                // Listen for state transitions
                .onTransition(state => {
                    if (state.changed) {
                        console.log('event: ', state.event);
                        console.log('state: ', state.value);
                        // console.log(state.context);
                        handler(state);
                    }
                })
                // Start the service
                .start();

            return this.machine;
        },
        (handler, service) => {
            service.stop();
        },
    ).pipe(share());
    ready$ = this.state$.pipe(
        pluck('context', 'ready'),
        shareReplay(),
    );
    game$: Observable<GameInfo> = this.state$.pipe(
        pluck('context', 'currentGame'),
        shareReplay(),
    );
    selectedPlayer$ = this.state$.pipe(
        pluck('context', 'selectedPlayer'),
        shareReplay(),
    );

    question$ = this.state$.pipe(
        pluck('context', 'question'),
        distinctUntilChanged(),
        shareReplay(),
    );

    expectedAnswer$ = this.state$.pipe(
        pluck('context', 'expectedAnswer'),
        distinctUntilChanged(),
        shareReplay(),
    );

    win$ = this.state$.pipe(
        filter(state => state.matches('PLAYING.WIN')),
        pluck('context', 'timeLeft'),
    );

    lose$ = this.state$.pipe(
        filter(state => state.matches('PLAYING.LOSE')),
        pluck('context', 'winner'),
    );
    sendEvent(event: AppEvent | GameEvent) {
        this.machine.send(event);
    }
}
