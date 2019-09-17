import { PlayerState } from './playerState.model';

export interface CurrentPlayerState {
  current: PlayerState;
  attempt: {
    answer: string[];
    numbers: string[];
  };
}
