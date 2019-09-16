import { Test, TestingModule } from '@nestjs/testing';
import { StoreModule } from '../store/store.module';
import { EventModule } from '../event/event.module';
import { GameService, playersReady } from './game.service';
import { GameStore } from './game.store';
import { PlayerModule } from '../player/player.module';
import { PlayerMap } from '../player/player.store';
import { Map } from 'immutable';
import { Player } from '../models/player';

describe('player ready', () => {
    const fakePlayer = (ready: boolean): Player => ({
        id: '123',
        client: '' as any,
        name: 'name',
        ready,
        avatar: 'avatar',
    });
    it('should be false', () => {
        expect(playersReady(Map())).toBe(false);
        expect(playersReady(Map({ '123': fakePlayer(true) }) as PlayerMap));
        expect(
            playersReady(Map({
                '123': fakePlayer(false),
                '234': fakePlayer(false),
            }) as PlayerMap),
        ).toBe(false);
        expect(
            playersReady(Map({
                '123': fakePlayer(true),
                '234': fakePlayer(false),
            }) as PlayerMap),
        ).toBe(false);
        expect(
            playersReady(Map({
                '123': fakePlayer(true),
                '234': fakePlayer(false),
                '345': fakePlayer(false),
            }) as PlayerMap),
        ).toBe(false);
        expect(
            playersReady(Map({
                '123': fakePlayer(true),
                '234': fakePlayer(true),
                '345': fakePlayer(false),
                '456': fakePlayer(false),
                '567': fakePlayer(false),
            }) as PlayerMap),
        ).toBe(false);
    });
    it('should be true', () => {
        expect(
            playersReady(Map({
                '123': fakePlayer(true),
                '345': fakePlayer(true),
            }) as PlayerMap),
        ).toBe(true);
        expect(
            playersReady(Map({
                '123': fakePlayer(true),
                '234': fakePlayer(true),
                '345': fakePlayer(false),
            }) as PlayerMap),
        ).toBe(true);
        expect(
            playersReady(Map({
                '123': fakePlayer(true),
                '234': fakePlayer(true),
                '345': fakePlayer(false),
                '456': fakePlayer(false),
            }) as PlayerMap),
        ).toBe(true);
        expect(
            playersReady(Map({
                '123': fakePlayer(true),
                '234': fakePlayer(true),
                '345': fakePlayer(true),
                '456': fakePlayer(false),
                '567': fakePlayer(false),
            }) as PlayerMap),
        ).toBe(true);
    });
});

describe('GameService', () => {
    let service: GameService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [StoreModule, EventModule, PlayerModule],
            providers: [GameService, GameStore],
        }).compile();

        service = module.get(GameService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
