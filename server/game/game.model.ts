import { getOrElse, Option } from 'fp-ts/lib/Option';
import { GamePlayerMap } from '../models/game';

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
