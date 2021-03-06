import { Injectable } from '@nestjs/common';
import { PlayerService } from '../player/player.service';
import {
    filter,
    map,
    withLatestFrom,
    pluck,
    distinctUntilChanged,
    mapTo,
    tap,
} from 'rxjs/operators';
import { merge } from 'rxjs';
import { PlayerMap } from '../player/player.store';
import { GamePlayerMap } from '../models/game';
import { Map } from 'immutable';
import { EventService } from '../event/event.service';
import { IN_EVENT } from '../event/in-events';
import {
    GameEventType,
    GameReady,
    GameNotReady,
    GameStart,
    GameEnd,
} from './game.state';
import { GameMachine } from './game.machine';

export const playersReady = (players: PlayerMap): boolean => {
    const numberOfReady = players.filter(p => p.ready).size;
    const result = numberOfReady > 1;
    return result;
};

export const transformToGamePlayerMap = (playerMap: PlayerMap): GamePlayerMap =>
    playerMap
        .filter(p => p.ready)
        .map(p => p.id)
        .reduce(
            (map, id) =>
                map.set(id, {
                    id,
                    score: 0,
                }),
            Map() as GamePlayerMap,
        );

@Injectable()
export class GameService {
    constructor(
        private readonly gameMachine: GameMachine,
        private readonly playerService: PlayerService,
        private readonly eventService: EventService,
    ) {
        this.broadcastStartGame$.subscribe(i =>
            eventService.broadcastStartGame(i),
        );
        this.endGame$.subscribe(i => eventService.broadcastEndGame(i));
        merge(this.gameReady$, this.startGame$, this.resetGame$).subscribe(i =>
            gameMachine.sendEvent(i),
        );
        this.playerQuit$.subscribe(() =>
            eventService.receiveEvent(null, IN_EVENT.RESET_GAME),
        );
    }

    gameReady$ = this.playerService.onlinePlayers$.pipe(
        filter(playersReady),
        distinctUntilChanged(),
        map(
            (ready): GameReady | GameNotReady =>
                ready
                    ? { type: GameEventType.READY }
                    : { type: GameEventType.NOT_READY },
        ),
    );

    gameStateReady$ = this.gameReady$.pipe(
        map(
            (ready): GameReady | GameNotReady =>
                ready
                    ? { type: GameEventType.READY }
                    : { type: GameEventType.NOT_READY },
        ),
    );

    gamePlayers$ = this.gameMachine.gamers$.pipe(
        withLatestFrom(this.playerService.onlinePlayers$),
        map(([gamers, players]) =>
            gamers
                .filter((_, key) => players.has(key))
                .map((_, key) => players.get(key).client),
        ),
    );

    startGame$ = this.eventService.listenFor(IN_EVENT.START).pipe(
        withLatestFrom(this.playerService.onlinePlayers$),
        pluck(1),
        map(
            (players): GameStart => {
                const gamers = transformToGamePlayerMap(players);
                return { type: GameEventType.START, payload: gamers };
            },
        ),
    );

    broadcastStartGame$ = this.gameMachine.state$.pipe(
        filter(
            state =>
                state.event.type === GameEventType.START &&
                state.matches('PLAYING'),
        ),
        distinctUntilChanged(),
        withLatestFrom(
            this.gameMachine.context$,
            this.playerService.onlinePlayers$,
        ),
        map(([, context, onlinePlayers]) => {
            const clients = onlinePlayers
                .map(p => p.client)
                .toIndexedSeq()
                .toArray();
            const players = context.players
                .map(({ id, score }) => ({ score, id }))
                .toIndexedSeq()
                .toArray();
            const { totalRounds } = context;
            return { clients, data: { players, totalRounds } };
        }),
    );

    endGame$ = this.gameMachine.state$.pipe(
        filter(state => state.event.type === GameEventType.END),
        withLatestFrom(
            this.gameMachine.context$,
            this.playerService.onlinePlayers$,
        ),
        map(([, context, onlinePlayers]) => {
            const clients = onlinePlayers
                .map(p => p.client)
                .toIndexedSeq()
                .toArray();
            const players = context.players
                .map(({ id, score }) => ({ score, id }))
                .toIndexedSeq()
                .toArray();
            const winner = players.reduce(
                (prev, cur) => (cur.score > prev.score ? cur : prev),
                { id: null, score: 0 },
            ).id;
            return { clients, data: { players, winner } };
        }),
        tap(() => this.eventService.receiveEvent(null, IN_EVENT.RESET_PLAYER)),
    );

    playerQuit$ = this.playerService.removePlayer$.pipe(
        withLatestFrom(this.gameMachine.gamers$),
        filter(([player, gamers]) => gamers.has(player)),
    );

    resetGame$ = this.eventService
        .listenFor(IN_EVENT.RESET_GAME)
        .pipe(mapTo({ type: GameEventType.END } as GameEnd));
}
