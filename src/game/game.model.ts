import { getOrElse, Option, none } from 'fp-ts/lib/Option';
import { Game, GamePlayerMap } from '../models/game';
import { Monoid } from 'fp-ts/lib/Monoid';
import { Map } from 'immutable';
import { Lens } from 'monocle-ts';

export const initialState: Game = {
    ready: false,
    players: Map(),
    question: none,
    expectedAnswer: none,
    startTime: none,
};

export const gameLens = Lens.fromPath<Game>();

export const concatPlayers: Monoid<GamePlayerMap>['concat'] = (
    oldOne,
    newOne,
) =>
    newOne.reduce(
        (acc, newValue, key) =>
            acc.update(key, old => ({ ...old, ...newValue })),
        oldOne,
    );

const getOrUndefined = <T>(data: Option<T>) =>
    getOrElse<T>(() => undefined)(data);

export const serialzedPlayers = (players: GamePlayerMap) =>
    players
        .map(({ attempt, ...rest }) => ({
            attempt: getOrUndefined(attempt),
            ...rest,
        }))
        .toObject();

export interface SerializedGameState {
    ready: boolean;
    players: {
        [id: string]: {
            score: number;
            attempt: {
                answer: any[];
                numbers: number[];
            };
        };
    };
    question: number[];
    expectedAnswer: number;
    startTime: string;
}

export const serializeGameState = ({
    ready,
    players,
    question,
    expectedAnswer,
    startTime,
}: Game): SerializedGameState => ({
    ready,
    players: serialzedPlayers(players),
    question: getOrUndefined(question),
    expectedAnswer: getOrUndefined(expectedAnswer),
    startTime: getOrUndefined(startTime),
});
