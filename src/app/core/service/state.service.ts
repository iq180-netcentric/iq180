import { Injectable } from '@angular/core';
import { Machine, interpret, assign, send } from 'xstate';
import { fromEventPattern } from 'rxjs';
import { pluck, share } from 'rxjs/operators';
import {
    GameEvent,
    gameMachine,
    GameEventType,
} from 'src/app/home/game-field/game-state.service';
import { GameInfo, GameMode } from '../models/game/game.model';

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
    players: any[];
    ready: boolean;
    currentGame?: GameInfo;
}

export const enum AppEventType {
    READY = 'READY',
    START_GAME = 'START_GAME',
    END_GAME = 'END_GAME',
}

export interface AppReady {
    type: AppEventType.READY;
    payload: boolean;
}

export interface AppStart {
    type: AppEventType.START_GAME;
    payload: GameInfo;
}

export interface AppEndGame {
    type: AppEventType.END_GAME;
}
export type AppEvent = AppReady | AppStart | AppEndGame;
@Injectable({
    providedIn: 'root',
})
export class StateService {
    static machine = Machine<AppContext, AppStateSchema, AppEvent>(
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
                            actions: 'SET_GAME',
                        },
                    },
                },
                [AppState.PLAYING]: {
                    on: {
                        [AppEventType.END_GAME]: {
                            target: AppState.IDLE,
                            cond: (ctx, evt) =>
                                ctx.currentGame.mode === GameMode.singlePlayer,
                            actions: ['CLEAR_GAME'],
                            // actions: send(
                            //     () => ({
                            //         type: GameEventType.EXIT,
                            //     }),
                            //     { to: 'game' },
                            // ),
                        },
                    },
                    invoke: {
                        id: 'game',
                        src: gameMachine,
                        data: {
                            game: ctx => ctx.currentGame,
                        },
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
                        [AppEventType.START_GAME]: AppState.PLAYING,
                    },
                },
            },
        },
        {
            actions: {
                SET_READY: assign<AppContext>({ ready: () => true }),
                UNSET_READY: assign<AppContext>({ ready: () => false }),
                SET_GAME: assign<AppContext>({
                    currentGame: (ctx, evt) => evt.payload,
                }),
                CLEAR_GAME: assign<AppContext>({
                    currentGame: () => undefined,
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
            console.log(handler, service);
            service.stop();
        },
    ).pipe(share());
    ready$ = this.state$.pipe(pluck('context', 'ready'));
    game$ = this.state$.pipe(pluck('context', 'currentGame'));
    sendEvent(event: AppEvent) {
        this.machine.send(event);
    }
}
