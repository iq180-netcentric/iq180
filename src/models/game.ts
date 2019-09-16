import { Option } from 'fp-ts/lib/Option';
import { Map } from 'immutable';

export interface Attempt {
    answer: any[];
    numbers: number[];
}

export interface GamePlayer {
    id: string;
    score: number;
    attempt: Option<Attempt>;
    reset: boolean;
}

export type GamePlayerMap = Map<string, GamePlayer>;

export interface Game {
    ready: boolean;
    players: GamePlayerMap;
    question: Option<number[]>;
    expectedAnswer: Option<number>;
    startTime: Option<string>;
}
