import { Injectable } from '@nestjs/common';
import { EventService } from '../event/event.service';
import { IN_EVENT, AnswerEvent } from '../event/in-events';
import {
    map,
    filter,
    withLatestFrom,
    distinctUntilChanged,
    delay,
} from 'rxjs/operators';
import { Answer, RoundEventType } from './round.state';
import { GameMachine } from '../game/game.machine';
import { GameService, broadcastStartGame } from '../game/game.service';
import { merge } from 'rxjs';
import { PlayerService } from '../player/player.service';

@Injectable()
export class RoundService {
    constructor(
        private readonly eventService: EventService,
        private readonly playerService: PlayerService,
        private readonly gameMachine: GameMachine,
        private readonly gameService: GameService,
    ) {
        this.answer$.subscribe(answer => gameMachine.sendEvent(answer));
        merge(this.emitQuestion$, this.broadcastCurrentPlayer$).subscribe(
            question => eventService.broadcastStartTurn(question),
        );
        this.endTurn$.subscribe(data => eventService.broadcastEndTurn(data));
        this.startRound$.subscribe(p => eventService.broadcastStartRound(p));
        this.endRound$.subscribe(w => eventService.broadcastEndRound(w));
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
        filter(state => state.event.type === RoundEventType.START_ROUND),
        withLatestFrom(
            this.gameMachine.gamers$,
            this.playerService.onlinePlayers$,
        ),
        map(([, gamers, players]) => {
            return broadcastStartGame(gamers, players);
        }),
    );

    endRound$ = this.gameMachine.state$.pipe(
        filter(state => state.event.type === ('done.invoke.round' as any)),
        withLatestFrom(
            this.gameMachine.context$,
            this.playerService.onlinePlayers$,
        ),
        map(([, context, players]) => {
            const { winner } = context;
            return {
                data: winner,
                clients: players
                    .map(p => p.client)
                    .toIndexedSeq()
                    .toArray(),
            };
        }),
    );
    startTurn$ = this.gameMachine.state$.pipe(
        filter(state => state.event.type === RoundEventType.START_TURN),
        delay(5000),
    );

    emitQuestion$ = this.startTurn$.pipe(
        withLatestFrom(this.gameMachine.round$, this.gameService.gamePlayers$),
        map(([, round, players]) => {
            const { currentPlayer, solution, ...rest } = round;
            const clients = [players.get(currentPlayer)];
            console.log('/////////');
            console.log(round);
            return {
                clients,
                data: {
                    ...rest,
                    currentPlayer,
                },
            };
        }),
    );

    broadcastCurrentPlayer$ = this.startTurn$.pipe(
        withLatestFrom(
            this.gameMachine.round$,
            this.playerService.onlinePlayers$,
        ),
        map(([, round, players]) => {
            const { currentPlayer } = round;
            const clients = players
                .filter(p => p.id != currentPlayer)
                .map(p => p.client)
                .toIndexedSeq()
                .toArray();
            console.log(clients);
            return {
                clients,
                data: { currentPlayer },
            };
        }),
    );
    endTurn$ = this.gameMachine.state$.pipe(
        filter(state => state.event.type === RoundEventType.END_TURN),
        withLatestFrom(this.playerService.onlinePlayers$),
        map(([, players]) => {
            const clients = players
                .map(p => p.client)
                .toIndexedSeq()
                .toArray();
            return { clients };
        }),
    );
}
