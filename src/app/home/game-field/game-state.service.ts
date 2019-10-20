import { Injectable } from '@angular/core';
import { Machine, assign, State, interpret, send } from 'xstate';
import { fromEventPattern } from 'rxjs';
import { pluck } from 'rxjs/operators';
import { GameMode } from 'src/app/core/models/game/game.model';
import { AppEventType } from 'src/app/core/service/state.service';

export const enum GameState {
    WAITING = 'WAITING',
    PLAYING = 'PLAYING',
    WIN = 'WIN',
    LOSE = 'LOSE',
    EXIT = 'EXIT',
}

interface GameStateSchema {
    states: {
        [GameState.PLAYING]: {};
        [GameState.WAITING]: {};
        [GameState.WIN]: {};
        [GameState.LOSE]: {};
        [GameState.EXIT]: {};
    };
}

export interface GameContext {
    gameMode: GameMode;
    roundData: {
        round: number;
        score: number;
    };
    player: any;
    currentPlayer: any;
}
export const enum GameEventType {
    QUESTION = 'GAME_START',
    WIN = 'WIN',
    LOSE = 'LOSE',
    WAIT = 'WAIT',
    END = 'END',
    START_ROUND = 'START_ROUND',
    END_ROUND = 'END_ROUND',
    OK_CLICK = 'OK_CLICK',
    CANCEL_CLICK = 'CANCEL_CLICK',
    ATTEMPT = 'ATTEMPT',
    EXIT = 'EXIT',
}
export interface GameWin {
    type: GameEventType.WIN;
}
export interface GameLose {
    type: GameEventType.LOSE;
}
export interface GameEnd {
    type: GameEventType.END;
}
export interface GameStartRound {
    type: GameEventType.START_ROUND;
    payload: {
        playing: boolean;
    };
}
export interface GameEndRound {
    type: GameEventType.END_ROUND;
    payload: 'WIN' | 'LOSE';
}
export interface GameWait {
    type: GameEventType.WAIT;
}
export interface GameOkClick {
    type: GameEventType.OK_CLICK;
}
export interface GameCancelClick {
    type: GameEventType.CANCEL_CLICK;
}
export interface GameAnswerAttempt {
    type: GameEventType.ATTEMPT;
}
export interface GameExit {
    type: GameEventType.EXIT;
}
export type GameEvent =
    | GameWin
    | GameLose
    | GameEnd
    | GameWait
    | GameStartRound
    | GameEndRound
    | GameOkClick
    | GameCancelClick
    | GameExit
    | GameAnswerAttempt;

export const gameMachine = Machine<GameContext, GameStateSchema, GameEvent>({
    initial: GameState.PLAYING,
    context: {
        gameMode: GameMode.singlePlayer,
        roundData: {
            round: 0,
            score: 0,
        },
        player: null,
        currentPlayer: null,
    },
    states: {
        [GameState.PLAYING]: {
            on: {
                [GameEventType.EXIT]: {
                    target: GameState.EXIT,
                    cond: (ctx, evt) => ctx.gameMode !== GameMode.singlePlayer,
                },
                [GameEventType.WIN]: GameState.WIN,
                [GameEventType.END_ROUND]: [
                    {
                        target: GameState.WIN,
                        cond: (ctx, evt) =>
                            ctx.gameMode !== GameMode.singlePlayer &&
                            evt.payload === 'WIN',
                        actions: assign({
                            roundData: ctx => {
                                return {
                                    score: ctx.roundData.score + 1,
                                };
                            },
                        }),
                    },
                    {
                        target: GameState.LOSE,
                        cond: (ctx, evt) =>
                            ctx.gameMode !== GameMode.singlePlayer &&
                            evt.payload === 'LOSE',
                    },
                ],
            },
            after: {
                60000: GameState.LOSE,
            },
        },
        [GameState.WAITING]: {
            on: {
                [GameEventType.END_ROUND]: {
                    target: GameState.PLAYING,
                    cond: (ctx, evt) => ctx.gameMode !== GameMode.singlePlayer,
                },
            },
        },
        [GameState.WIN]: {
            on: {
                [GameEventType.EXIT]: {
                    target: GameState.EXIT,
                    cond: (ctx, evt) => ctx.gameMode !== GameMode.singlePlayer,
                },
                [GameEventType.OK_CLICK]: {
                    target: GameState.PLAYING,
                    cond: (ctx, evt) => ctx.gameMode === GameMode.singlePlayer,
                    actions: send(GameEventType.START_ROUND),
                },
                [GameEventType.CANCEL_CLICK]: {
                    target: GameState.EXIT,
                    cond: (ctx, evt) => ctx.gameMode === GameMode.singlePlayer,
                },
                [GameEventType.START_ROUND]: [
                    {
                        target: GameState.PLAYING,
                        cond: (ctx, evt) =>
                            ctx.gameMode !== GameMode.singlePlayer,
                        actions: assign({
                            roundData: ctx => {
                                return {
                                    round: ctx.roundData.round + 1,
                                };
                            },
                        }),
                    },
                    {
                        target: GameState.PLAYING,
                        cond: (ctx, evt) =>
                            ctx.gameMode !== GameMode.singlePlayer &&
                            evt.payload.playing,
                    },
                ],
            },
        },
        [GameState.LOSE]: {
            on: {
                [GameEventType.EXIT]: {
                    target: GameState.EXIT,
                    cond: (ctx, evt) => ctx.gameMode !== GameMode.singlePlayer,
                },
                [GameEventType.OK_CLICK]: {
                    target: GameState.PLAYING,
                    cond: (ctx, evt) => ctx.gameMode === GameMode.singlePlayer,
                },
                [GameEventType.CANCEL_CLICK]: {
                    target: GameState.EXIT,
                    cond: (ctx, evt) => ctx.gameMode === GameMode.singlePlayer,
                },
                [GameEventType.START_ROUND]: [
                    {
                        target: GameState.PLAYING,
                        cond: (ctx, evt) =>
                            ctx.gameMode !== GameMode.singlePlayer,
                        actions: assign({
                            roundData: ctx => {
                                return {
                                    round: ctx.roundData.round + 1,
                                };
                            },
                        }),
                    },
                    {
                        target: GameState.PLAYING,
                        cond: (ctx, evt) =>
                            ctx.gameMode !== GameMode.singlePlayer &&
                            evt.payload.playing,
                    },
                ],
            },
        },
        [GameState.EXIT]: {
            type: 'final',
        },
    },
});

@Injectable({
    providedIn: 'root',
})
export class GameStateService {
    private machine = interpret(gameMachine);
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
        (handler, service) => service.stop(),
    );
    gamers$ = this.state$.pipe(pluck('context', 'players'));
    sendEvent(event: GameEvent) {
        this.machine.send(event);
    }
}
