import { Player } from '../player.model';

export enum GameMode {
    singlePlayer = 'SINGLE_PLAYER',
    multiPlayer = 'MULTI_PLAYER',
    freeForAll = 'FreeForAll',
}

export interface GameInfo {
    mode: GameMode;
    rounds?: number;
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

export interface GameQuestion {
    question: number[];
    expectedAnswer: number;
}
