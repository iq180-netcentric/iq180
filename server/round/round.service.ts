import { Injectable } from '@nestjs/common';
import { EventService } from '../event/event.service';
import { IN_EVENT, AnswerEvent } from '../event/in-events';
import { map, filter, withLatestFrom } from 'rxjs/operators';
import { Answer, RoundEventType } from './round.state';
import { GameMachine } from '../game/game.machine';
import { GameService, broadcastStartGame } from '../game/game.service';

@Injectable()
export class RoundService {
    constructor(
        private readonly eventService: EventService,
        private readonly gameMachine: GameMachine,
        private readonly gameService: GameService,
    ) {
        this.answer$.subscribe(answer => gameMachine.sendEvent(answer));
        this.emitQuestion$.subscribe(question =>
            eventService.emitStartTurn(question),
        );
        this.broadCurrentPlayer$.subscribe(player =>
            eventService.broadcastCurrentPlayer(player),
        );
        this.endTurn$.subscribe(() => eventService.emitEndTurn(null));
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
        filter(state => state.matches('PLAYING.ROUND.START')),
        withLatestFrom(this.gameMachine.gamers$, this.gameService.gamePlayers$),
        map(([, gamers, players]) => {
            return broadcastStartGame(gamers, players);
        }),
    );

    endRound$ = this.gameMachine.state$.pipe(
        filter(state => state.matches('PLAYING.ROUND.END')),
        withLatestFrom(
            this.gameMachine.context$,
            this.gameService.gamePlayers$,
        ),
        map(([, context, players]) => {
            const { winner } = context;
            return {
                data: winner,
                clients: players.toIndexedSeq().toArray(),
            };
        }),
    );
    startTurn$ = this.gameMachine.state$.pipe(
        filter(state => state.matches('PLAYING.TURN.START')),
    );

    emitQuestion$ = this.startTurn$.pipe(
        withLatestFrom(this.gameMachine.round$, this.gameService.gamePlayers$),
        map(([, round, players]) => {
            const { currentPlayer, solution, startTime, ...rest } = round;
            const client = players.get(currentPlayer);
            return {
                client,
                data: { ...rest, startTime: startTime.toISOString() },
            };
        }),
    );

    broadCurrentPlayer$ = this.startTurn$.pipe(
        withLatestFrom(this.gameMachine.round$, this.gameService.gamePlayers$),
        map(([, round, players]) => {
            const { currentPlayer } = round;
            return {
                clients: players.toIndexedSeq().toArray(),
                data: currentPlayer,
            };
        }),
    );
    endTurn$ = this.gameMachine.state$.pipe(
        filter(state => state.matches('PLAYING.TURN.END')),
        withLatestFrom(this.gameMachine.round$, this.gameService.gamePlayers$),
        map(([, round, players]) => {
            const { currentPlayer } = round;
            const client = players.get(currentPlayer);
            return { client };
        }),
    );
}
