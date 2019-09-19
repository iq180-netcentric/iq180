import { Player } from '../player.model';

export enum GameMode {
    singlePlayer = 'SINGLE_PLAYER',
    multiPlayer = 'MULTI_PLAYER',
}

export interface Game {
    mode: GameMode;
    ready: boolean;
    players: (Player & Attempt)[];
}

export interface GameRound {
    startTime: Date;
    question: number[];
    expectedAnswer: number;
}

export interface Attempt {
    numbers: number[];
    answer: (string | number)[];
}
