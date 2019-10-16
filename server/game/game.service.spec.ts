import { playersReady, transformToGamePlayerMap } from './game.service';
import { PlayerMap } from '../player/player.store';
import { Map } from 'immutable';
import { Player } from '../models/player';
import { GamePlayerMap } from '../models/game';
import { none } from 'fp-ts/lib/Option';

const fakePlayer = (ready: boolean, id: string = '123'): Player => ({
    id,
    client: '' as any,
    name: 'name',
    ready,
    avatar: 'avatar',
});

describe('player ready', () => {
    it('should be false', () => {
        expect(playersReady(Map())).toBe(false);
        expect(playersReady(Map({ '123': fakePlayer(true) }) as PlayerMap));
        expect(
            playersReady(<PlayerMap>Map({
                '123': fakePlayer(false),
                '234': fakePlayer(false),
            })),
        ).toBe(false);
        expect(
            playersReady(<PlayerMap>Map({
                '123': fakePlayer(true),
                '234': fakePlayer(false),
            })),
        ).toBe(false);
        expect(
            playersReady(<PlayerMap>Map({
                '123': fakePlayer(true),
                '234': fakePlayer(false),
                '345': fakePlayer(false),
            })),
        ).toBe(false);
    });
    it('should be true', () => {
        expect(
            playersReady(<PlayerMap>Map({
                '123': fakePlayer(true),
                '345': fakePlayer(true),
            })),
        ).toBe(true);
        expect(
            playersReady(<PlayerMap>Map({
                '123': fakePlayer(true),
                '234': fakePlayer(true),
                '345': fakePlayer(false),
            })),
        ).toBe(true);
        expect(
            playersReady(<PlayerMap>Map({
                '123': fakePlayer(true),
                '234': fakePlayer(true),
                '345': fakePlayer(false),
                '456': fakePlayer(false),
            })),
        ).toBe(true);
        expect(
            playersReady(<PlayerMap>Map({
                '123': fakePlayer(true),
                '234': fakePlayer(true),
                '345': fakePlayer(false),
                '456': fakePlayer(false),
                '567': fakePlayer(false),
            })),
        ).toBe(true);
        expect(
            playersReady(<PlayerMap>Map({
                '123': fakePlayer(true),
                '234': fakePlayer(true),
                '345': fakePlayer(true),
                '456': fakePlayer(false),
                '567': fakePlayer(false),
            })),
        ).toBe(true);
    });
});

describe('tranform PlayerMap to  GamePlayerMap', () => {
    it('should transform correctly', () => {
        const empty = <PlayerMap>Map();
        expect(transformToGamePlayerMap(empty)).toEqual(Map());
        const players = empty.set('1234', fakePlayer(true, '1234'));
        expect(transformToGamePlayerMap(players)).toEqual(<GamePlayerMap>Map({
            '1234': {
                id: '1234',
                score: 0,
                reset: false,
                attempt: none,
            },
        }));
    });
    it('should filter non-ready', () => {
        const players = <PlayerMap>Map()
            .set('1234', fakePlayer(true, '1234'))
            .set('2345', fakePlayer(false, '2345'));
        expect(transformToGamePlayerMap(players)).toEqual(<GamePlayerMap>Map({
            '1234': {
                id: '1234',
                score: 0,
                reset: false,
                attempt: none,
            },
        }));
    });
});
