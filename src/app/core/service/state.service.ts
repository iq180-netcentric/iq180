import { Injectable } from '@angular/core';
import { Machine, interpret } from 'xstate';

@Injectable({
    providedIn: 'root',
})
export class StateService {
    static machine = Machine({
        id: 'light',
        initial: 'idle',
        context: {
            elapsed: 0,
            direction: 'east',
        },
        states: {
            idle: {
                on: {
                    READY: 'ready',
                },
            },
            ready: {
                on: {
                    IDLE: 'idle',
                },
            },
            playing: {
                initial: 'playing',
                states: {
                    playing: {
                        on: {
                            ANSWERED: 'waiting',
                        },
                    },
                    waiting: {
                        on: {
                            ROUND_END: 'endRound',
                        },
                    },
                    endRound: {
                        on: {
                            NEXT_ROUND: 'playing',
                        },
                    },
                },
            },
            single: {
                initial: 'playing',
                states: {
                    playing: {
                        on: {
                            ANSWERED: 'endRound',
                            TIMEOUT: 'endRound',
                        },
                    },
                    endRound: {
                        on: {
                            RESTART: 'playing',
                        },
                    },
                    end: {
                        type: 'final',
                    },
                },
            },
        },
    });

    service = interpret(StateService.machine);

    constructor() {}
}
