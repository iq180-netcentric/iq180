import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Player } from '../models/player.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  player$ = new BehaviorSubject<Player>(
    JSON.parse(localStorage.getItem('player') || null)
  );

  constructor() {
    this.player$.subscribe(player => {
      localStorage.setItem('player', JSON.stringify(player));
    });
  }

  setPlayer(player: Player) {
    this.player$.next(player);
  }
}
