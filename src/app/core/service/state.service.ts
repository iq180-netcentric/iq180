import { Injectable } from '@angular/core';
import { Machine, interpret, assign, send } from 'xstate';
import { fromEventPattern } from 'rxjs';
import {
    pluck,
    share,
    shareReplay,
    distinctUntilChanged,
} from 'rxjs/operators';
import {
    GameEvent,
    gameMachine,
    GameEventType,
    GameContext,
} from 'src/app/home/game-field/game-state.service';
import { GameInfo, GameMode } from '../models/game/game.model';
import { Player } from '../models/player.model';
import { generate } from 'iq180-logic';

export const enum AppState {
    IDLE = 'IDLE',
    PLAYING = 'PLAYING',
    READY = 'READY',
}

interface AppStateSchema {
    states: {
        [AppState.IDLE]: {};
        [AppState.PLAYING]: {};
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
        player: Player;
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
                    entry: 'GENERATE_QUESTION',
                    on: {
                        [GameEventType.SKIP]: {
                            actions: 'GENERATE_QUESTION',
                        },
                        [GameEventType.ATTEMPT]: {
                            actions: send((_, evt) => evt, { to: 'game' }),
                        },
                        [AppEventType.SELECT_PLAYER]: {
                            actions: ['SELECT_PLAYER'],
                        },
                        [AppEventType.END_GAME]: {
                            target: AppState.IDLE,
                            cond: (ctx, evt) =>
                                ctx.currentGame.mode === GameMode.singlePlayer,
                            actions: ['CLEAR_GAME'],
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
                    selectedPlayer: (_, evt) => {
                        return evt.payload.player;
                    },
                    currentGame: (_, evt) => evt.payload.info,
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
            },
        },
    );

    machine = interpret(StateService.machine);

    constructor() {}

    state$ = fromEventPattern(
        handler => {
            this.machine
                // Listen for state transitions
                .onTransition(state => {
                    if (state.changed) {
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
    ).pipe(shareReplay());
    ready$ = this.state$.pipe(pluck<AppContext, boolean>('context', 'ready'));
    game$ = this.state$.pipe(
        pluck<AppContext, GameInfo>('context', 'currentGame'),
    );
    selectedPlayer$ = this.state$.pipe(
        pluck<AppContext, Player>('context', 'selectedPlayer'),
        shareReplay(),
    );

    question$ = this.state$.pipe(
        pluck<AppContext, number[]>('context', 'question'),
        distinctUntilChanged(),
        shareReplay(),
    );

    expectedAnswer$ = this.state$.pipe(
        pluck<AppContext, number>('context', 'expectedAnswer'),
        distinctUntilChanged(),
        shareReplay(),
    );

    sendEvent(event: AppEvent | GameEvent) {
        this.machine.send(event);
    }
}
