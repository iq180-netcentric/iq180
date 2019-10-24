import { Injectable, Inject } from '@angular/core';
import { BehaviorSubject, combineLatest, Subject } from 'rxjs';
import { Player } from '../models/player.model';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    player$: Subject<Player>;
    remember$: Subject<boolean>;

    constructor(@Inject(PLATFORM_ID) private platformId: object) {
        if (isPlatformBrowser(this.platformId)) {
            let user;
            try {
                user = JSON.parse(localStorage.getItem('player')) || undefined;
            } catch {
                user = undefined;
            }
            this.player$ = new BehaviorSubject<Player>(user);
            this.remember$ = new BehaviorSubject<boolean>(
                !!localStorage.getItem('player'),
            );
            combineLatest(this.player$, this.remember$).subscribe(([p, b]) => {
                if (b) {
                    localStorage.setItem('player', JSON.stringify(p));
                } else {
                    localStorage.removeItem('player');
                }
            });
        } else {
            this.player$ = new Subject<Player>();
            this.remember$ = new Subject<boolean>();
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
