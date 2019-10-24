import { Injectable } from '@nestjs/common';
import { EventService } from '../event/event.service';
import { IN_EVENT, AttemptEvent } from '../event/in-events';
import {
    map,
    filter,
    withLatestFrom,
    distinctUntilChanged,
    delay,
    pluck,
} from 'rxjs/operators';
import { Attempt, RoundEventType, StartTurn, EndTurn } from './round.state';
import { GameMachine } from '../game/game.machine';
import { GameService, broadcastStartGame } from '../game/game.service';
import { merge } from 'rxjs';
import { PlayerService } from '../player/player.service';
import { OUT_EVENT } from '../event/out-events';

@Injectable()
export class RoundService {
    constructor(
        private readonly eventService: EventService,
        private readonly playerService: PlayerService,
        private readonly gameMachine: GameMachine,
        private readonly gameService: GameService,
    ) {
        this.sendAttempt$.subscribe(answer => gameMachine.sendEvent(answer));
        merge(this.emitQuestion$, this.broadcastCurrentPlayer$).subscribe(
            question => eventService.broadcastStartTurn(question),
        );
        this.endTurn$.subscribe(data => eventService.broadcastEndTurn(data));
        this.startRound$.subscribe(p => eventService.broadcastStartRound(p));
        this.endRound$.subscribe(w => eventService.broadcastEndRound(w));
        this.broadcastAttempt$.subscribe(a => eventService.broadcastAttempt(a));
    }

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
        filter(state => state.event.type === RoundEventType.END_ROUND),
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
        map(state => state.event as StartTurn),
        delay(5000),
    );

    currentPlayer$ = this.startTurn$.pipe(
        map(({ payload }) => payload.currentPlayer),
    );

    attempt$ = this.eventService.listenFor<AttemptEvent>(IN_EVENT.ATTEMPT).pipe(
        withLatestFrom(this.currentPlayer$),
        filter(([{ client }, player]) => client.id === player),
        pluck(0),
    );

    broadcastAttempt$ = this.attempt$.pipe(
        withLatestFrom(this.playerService.onlinePlayers$),
        map(([{ data, client }, players]) => {
            const clients = players
                .filter(player => player.id !== client.id)
                .map(player => player.client)
                .toIndexedSeq()
                .toArray();
            return { clients, data };
        }),
    );

    sendAttempt$ = this.attempt$.pipe(
        delay(1),
        map(
            ({ data, client }): Attempt => ({
                type: RoundEventType.ATTEMPT,
                payload: { answer: data, player: client.id },
            }),
        ),
    );

    emitQuestion$ = this.startTurn$.pipe(
        withLatestFrom(this.gameService.gamePlayers$),
        filter(([{ payload }, players]) => players.has(payload.currentPlayer)),
        map(([{ payload }, players]) => {
            const { currentPlayer, solution, ...rest } = payload;
            const clients = [players.get(currentPlayer)];
            console.log('/////////');
            console.log(payload);
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
        withLatestFrom(this.playerService.onlinePlayers$),
        filter(([{ payload }, players]) => players.has(payload.currentPlayer)),
        map(([{ payload }, players]) => {
            const { currentPlayer } = payload;
            const clients = players
                .filter(p => p.id != currentPlayer)
                .map(p => p.client)
                .toIndexedSeq()
                .toArray();
            return {
                clients,
                data: { currentPlayer },
            };
        }),
    );
    endTurn$ = this.gameMachine.state$.pipe(
        filter(state => state.event.type === RoundEventType.END_TURN),
        map(state => state.event as EndTurn),
        withLatestFrom(this.playerService.onlinePlayers$),
        map(([event, players]) => {
            const clients = players
                .map(p => p.client)
                .toIndexedSeq()
                .toArray();
            console.log(event)
            return { clients, data: event.payload };
        }),
    );
}
