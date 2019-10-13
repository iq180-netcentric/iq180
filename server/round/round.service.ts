import { Injectable } from '@nestjs/common';
import { EventService } from '../event/event.service';
import { Round } from '../models/round';
import { currentTime, addSeconds } from './round.utils';
import { generate } from 'iq180-logic';
import { Subject, combineLatest, timer, merge } from 'rxjs';
import { IN_EVENT, AnswerEvent } from '../event/in-events';
import {
    switchMapTo,
    take,
    mapTo,
    map,
    filter,
    pluck,
    withLatestFrom,
    tap,
} from 'rxjs/operators';
import { RoundStore } from './round.store';
import { newQuestionAction } from './round.action';
import { isSome } from 'fp-ts/lib/Option';
import { StartRoundEvent } from '../event/out-events';
import { GameService } from '../game/game.service';
import { BroadcastMessage } from '../event/event.type';

const createRound = (): Round => {
    const generated = generate({});
    const now = currentTime();
    return {
        startTime: addSeconds(now, 5).toISOString(),
        ...generated,
    };
};

@Injectable()
export class RoundService {
    constructor(
        private readonly eventService: EventService,
        private readonly roundStore: RoundStore,
        private readonly gameService: GameService,
    ) {
        this.newRound$.subscribe(i => {
            roundStore.dispatch(i);
        });
        this.sendNewRound$.subscribe(i => eventService.broadcastStartRound(i));
        eventService.listenFor(IN_EVENT.START).subscribe(() => this.newRound());
        this.endRound$.subscribe(() => this.newRound());
    }

    startRound$ = new Subject();

    answer$ = this.eventService.listenFor<AnswerEvent>(IN_EVENT.ANSWER);

    correct$ = this.answer$.pipe();

    endRound$ = this.startRound$.pipe(
        switchMapTo(merge(this.correct$, timer(65000)).pipe(take(1))),
    );

    newRound$ = this.startRound$.pipe(
        map(createRound),
        map(newQuestionAction),
    );

    sendNewRound$ = this.roundStore.store$.pipe(
        filter(isSome),
        pluck('value'),
        map(
            ({ question, expectedAnswer, startTime }): StartRoundEvent => ({
                question,
                expectedAnswer,
                startTime,
            }),
        ),
        withLatestFrom(this.gameService.gamePlayers$),
        map(
            ([round, players]): BroadcastMessage => ({
                clients: players.toIndexedSeq().toArray(),
                data: round,
            }),
        ),
    );

    newRound = () => {
        this.startRound$.next();
    };
}
