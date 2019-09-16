import { Injectable } from '@nestjs/common';
import { GameStore } from './game.store';
import { PlayerService } from '../player/player.service';
import { filter, map, withLatestFrom } from 'rxjs/operators';
import { merge, Observable } from 'rxjs';
import { readyAction } from './game.action';
import { PlayerMap } from '../player/player.store';
import { Game } from '../models/game';

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
    return numberOfReady >= Math.ceil(numberOfPlayers / 2) && numberOfReady > 1;
};

export const playersReadyAction$ = (currentPlayers$: Observable<PlayerMap>) =>
    currentPlayers$.pipe(
        map(playersReady),
        map(readyAction),
    );
@Injectable()
export class GameService {
    constructor(
        private readonly gameStore: GameStore,
        private readonly playerService: PlayerService,
    ) {
        merge(playersReadyAction$(playerService.currentPlayers$)).subscribe(i =>
            gameStore.dispatch(i),
        );
}
}
