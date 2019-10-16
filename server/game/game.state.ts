import { GamePlayerMap } from '../models/game';
import { Machine, assign, interpret, State } from 'xstate';
import { Map } from 'immutable';
import { Injectable } from '@nestjs/common';
import { fromEventPattern } from 'rxjs';
import { pluck } from 'rxjs/operators';

export const enum GameState {
    WATING = 'WAITING',
    READY = 'READY',
    PLAYING = 'PLAYING',
}

interface GameStateSchema {
    states: {
        [GameState.WATING]: {};
        [GameState.READY]: {};
        [GameState.PLAYING]: {};
    };
}

// type GameContext = GamePlayerMap;
export interface GameContext {
    players: GamePlayerMap;
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
export type GameEvent = GameReady | GameNotReady | GameStart | GameEnd;

const gameMachine = Machine<GameContext, GameStateSchema, GameEvent>({
    initial: GameState.WATING,
    context: {
        players: Map(),
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
                [GameEventType.END]: GameState.WATING,
            },
        },
    },
});

@Injectable()
export class GameMachine {
    private machine = interpret(gameMachine);
    constructor() {}
    state$ = fromEventPattern<State<GameContext, GameEvent>>(
        handler => {
            this.machine
                // Listen for state transitions
                .onTransition(state => {
                    if (state.changed) handler(state);
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
