import { Player } from '../player.model';

export interface PlayerState {
  player: Player;
  isCurrent: boolean;
  score: number;
}
