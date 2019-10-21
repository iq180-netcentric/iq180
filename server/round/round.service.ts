import { Injectable } from '@nestjs/common';
import { EventService } from '../event/event.service';
import { IN_EVENT, AnswerEvent } from '../event/in-events';
import { map, filter } from 'rxjs/operators';
import { Answer, RoundEventType } from './round.state';
import { GameMachine } from '../game/game.machine';

@Injectable()
export class RoundService {
    constructor(
        private readonly eventService: EventService,
        private readonly gameMachine: GameMachine,
    ) {
        this.answer$.subscribe(answer => gameMachine.sendEvent(answer));
    }

    answer$ = this.eventService.listenFor<AnswerEvent>(IN_EVENT.ANSWER).pipe(
        map(
            ({ data, client }): Answer => ({
                type: RoundEventType.ANSWER,
                payload: { answer: data, player: client.id },
            }),
        ),
    );
    startRound$ = this.gameMachine.state$.pipe(
        filter(state => state.matches('PLAYING.ROUND.START')),
    );

    endRound$ = this.gameMachine.state$.pipe(
        filter(state => state.matches('PLAYING.ROUND.END')),
    );
    startTurn$ = this.gameMachine.state$.pipe(
        filter(state => state.matches('PLAYING.TURN.START')),
    );
    endTurn$ = this.gameMachine.state$.pipe(
        filter(state => state.matches('PLAYING.TURN.END')),
    );
}
