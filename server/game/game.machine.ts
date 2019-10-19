import { Injectable } from '@nestjs/common';
import { interpret, State } from 'xstate';
import { gameMachine, GameContext, GameEvent } from './game.state';
import { fromEventPattern } from 'rxjs';
import { share, pluck } from 'rxjs/operators';

@Injectable()
export class GameMachine {
    private machine = interpret(gameMachine);
    constructor() {}
    state$ = fromEventPattern<State<GameContext, GameEvent>>(
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
        (handler, service) => service.stop(),
    ).pipe(share());
    context$ = this.state$.pipe(pluck('context'));
    gamers$ = this.context$.pipe(pluck('players'));
    round$ = this.context$.pipe(pluck('round'));
    sendEvent(event: GameEvent) {
        this.machine.send(event);
    }
}
