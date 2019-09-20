import { Injectable } from '@nestjs/common';
import { GameStore } from './game.store';
import { PlayerService } from '../player/player.service';
import {
    filter,
    map,
    withLatestFrom,
    pluck,
    distinctUntilChanged,
    delay,
} from 'rxjs/operators';
import { merge, Observable } from 'rxjs';
import { readyAction, startAction } from './game.action';
import { PlayerMap } from '../player/player.store';
import { Game, GamePlayerMap } from '../models/game';
import { none } from 'fp-ts/lib/Option';
import { Map } from 'immutable';
import { EventService } from '../event/event.service';
import { IN_EVENT } from '../event/in-events';
import { serialzedGamePlayers } from './game.model';

export const gameIsReady = (gameStore$: Observable<Game>) => <T>(
    source: Observable<T>,
) =>
    source.pipe(
        withLatestFrom(gameStore$),
        filter(([, game]) => game.ready),
        map(([i]) => i),
    );

export const playersReady = (players: PlayerMap): boolean => {
    const numberOfPlayers = players.size;
    const numberOfReady = players.filter(p => p.ready).size;
    const result =
        numberOfReady >= Math.ceil(numberOfPlayers / 2) && numberOfReady > 1;
    return result;
};

export const playersReadyAction$ = (currentPlayers$: Observable<PlayerMap>) =>
    currentPlayers$.pipe(
        delay(0),
        map(playersReady),
        distinctUntilChanged(),
        map(readyAction),
    );

export const transformToGamePlayerMap = (playerMap: PlayerMap): GamePlayerMap =>
    playerMap
        .filter(p => p.ready)
        .map(p => p.id)
        .reduce(
            (map, id) =>
                map.set(id, {
                    id,
                    score: 0,
                    reset: false,
                    attempt: none,
                }),
            <GamePlayerMap>Map(),
        );
const startGameAction$ = (startGame$: Observable<GamePlayerMap>) =>
    startGame$.pipe(map(startAction));

@Injectable()
export class GameService {
    constructor(
        private readonly gameStore: GameStore,
        private readonly playerService: PlayerService,
        private readonly eventService: EventService,
    ) {
        merge(
            playersReadyAction$(playerService.onlinePlayers$),
            startGameAction$(this.startGame$),
        ).subscribe(i => gameStore.dispatch(i));
        this.broadcastStartGame.subscribe(i =>
            eventService.broadcastStartGame(i),
        );
    }
    startGame$ = this.eventService.listenFor(IN_EVENT.START).pipe(
        gameIsReady(this.gameStore.store$),
        withLatestFrom(this.playerService.onlinePlayers$),
        pluck(1),
        map(transformToGamePlayerMap),
    );

    broadcastStartGame = this.startGame$.pipe(
        withLatestFrom(this.playerService.onlinePlayers$),
        map(([gamers, players]) => {
            console.log(gamers);
            const clients = gamers
                .map((_, key) => players.get(key).client)
                .toIndexedSeq()
                .toArray();
            const data = serialzedGamePlayers(gamers);
            return { clients, data };
        }),
    );
}
