import { Injectable } from '@nestjs/common';
import { GameStore } from './game.store';
import { PlayerService } from '../player/player.service';
import { filter, map, withLatestFrom } from 'rxjs/operators';
import { merge, Observable } from 'rxjs';
import { readyAction } from './game.action';

@Injectable()
export class GameService {
    constructor(
        private readonly gameStore: GameStore,
        private readonly playerService: PlayerService,
    ) {
        merge(this.playersReady$).subscribe(i => gameStore.dispatch(i));
    }

    gameIsReady = () => <T>(source: Observable<T>) =>
        source.pipe(
            withLatestFrom(this.gameStore.store$),
            filter(([, game]) => game.ready),
            map(([i]) => i),
        );

    playersReady$ = this.playerService.currentPlayers$.pipe(
        map(players => {
            const numberOfPlayers = players.size;
            const numberOfReady = players.filter(p => p.ready).size;
            return (
                numberOfReady >= Math.ceil(numberOfPlayers / 2) &&
                numberOfReady > 1
            );
        }),
        map(readyAction),
    );
}
