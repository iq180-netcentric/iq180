import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { Player } from '../models/player.model';
import { filter } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    player$ = new BehaviorSubject<Player>(
        JSON.parse(localStorage.getItem('player') || null),
    );
    remember$ = new BehaviorSubject<boolean>(!!localStorage.getItem('player'));

    constructor() {
        combineLatest(this.player$, this.remember$).subscribe(([p, b]) => {
            if (b) {
                localStorage.setItem('player', JSON.stringify(p));
            } else {
                localStorage.removeItem('player');
            }
        });
    }

    setPlayer(player: Player) {
        this.player$.next(player);
    }

    clearPlayer() {
        this.player$.next(undefined);
        localStorage.removeItem('player');
    }
}
