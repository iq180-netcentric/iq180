import { getOrElse, Option, none } from 'fp-ts/lib/Option';
import { Game, GamePlayerMap, GAME_STATUS } from '../models/game';
import { Monoid } from 'fp-ts/lib/Monoid';
import { Map } from 'immutable';
import { Lens } from 'monocle-ts';

export const initialState: Game = {
    ready: false,
    status: GAME_STATUS.WAITING,
    players: Map(),
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

export const serialzedGamePlayers = (players: GamePlayerMap) =>
    players
        .map(({ attempt, ...rest }) => ({
            attempt: getOrUndefined(attempt),
            ...rest,
        }))
        .toIndexedSeq()
        .toArray();

export type SerialzedGamePlayers = ReturnType<typeof serialzedGamePlayers>;
export interface SerializedGameState {
    ready: boolean;
    players: SerialzedGamePlayers;
}

export const serializeGameState = ({
    ready,
    players,
}: Game): SerializedGameState => ({
    ready,
    players: serialzedGamePlayers(players),
});
