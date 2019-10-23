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
    GameState,
    GameEnd,
} from './game.state';
import { GameMachine } from './game.machine';
import { SocketClient } from '../event/event.type';
import { log } from '../utils';

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
            <GamePlayerMap>Map(),
        );

export const broadcastStartGame = (
    gamers: GamePlayerMap,
    players: PlayerMap,
) => {
    const clients = players
        .map(p => p.client)
        .toIndexedSeq()
        .toArray();
    const data = gamers
        .map(({ id, score }) => ({ score, id }))
        .toIndexedSeq()
        .toArray();
    return { clients, data };
};

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
        merge(this.gameReady$, this.startGame$, this.playerQuit$).subscribe(i =>
            gameMachine.sendEvent(i),
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
            gamers.map((_, key) => players.get(key).client),
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
        filter(state => state.event.type === GameEventType.START),
        distinctUntilChanged(),
        withLatestFrom(
            this.gameMachine.gamers$,
            this.playerService.onlinePlayers$,
        ),
        map(([, gamers, players]) => {
            return broadcastStartGame(gamers, players);
        }),
    );

    endGame$ = this.gameMachine.state$.pipe(
        filter(state => state.event.type === GameEventType.END),
        withLatestFrom(
            this.gameMachine.gamers$,
            this.playerService.onlinePlayers$,
        ),
        map(([, gamers, players]) => {
            return broadcastStartGame(gamers, players);
        }),
        log(),
    );

    playerQuit$ = this.playerService.removePlayer$.pipe(
        withLatestFrom(this.gameMachine.gamers$),
        filter(([player, gamers]) => gamers.has(player)),
        mapTo({ type: GameEventType.END } as GameEnd),
    );
}
