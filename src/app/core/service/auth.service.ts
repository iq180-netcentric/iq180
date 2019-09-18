import { Injectable, Inject } from '@angular/core';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { Player } from '../models/player.model';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    player$ = new BehaviorSubject<Player>(undefined);
    remember$ = new BehaviorSubject<boolean>(undefined);

    constructor(@Inject(PLATFORM_ID) private platformId: Object) {
        if (isPlatformBrowser(this.platformId)) {
            combineLatest(this.player$, this.remember$).subscribe(([p, b]) => {
                if (b) {
                    localStorage.setItem('player', JSON.stringify(p));
                } else {
                    localStorage.removeItem('player');
                }
            });
            this.player$.next(
                JSON.parse(localStorage.getItem('player')) || undefined,
            );
            this.remember$.next(!!localStorage.getItem('player'));
        }
    }

    setPlayer(player: Player) {
        this.player$.next(player);
    }

    clearPlayer() {
        if (isPlatformBrowser(this.platformId)) {
            this.player$.next(undefined);
            localStorage.removeItem('player');
        }
    }
}
