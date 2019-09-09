import { Test, TestingModule } from '@nestjs/testing';
import { RoomStore, players, ACTION } from './player.store';
import { Set } from 'immutable';
import { StoreModule } from '../store/store.module';
import { EventModule } from '../event/event.module';

describe('Players Store', () => {
    let store: RoomStore;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [StoreModule, EventModule],
            providers: [RoomStore],
        }).compile();

        store = module.get<RoomStore>(RoomStore);
    });

    it('should be defined', () => {
        expect(store).toBeDefined();
    });
    test('reducer should not mutate', () => {
        const fakeClient1 = { id: 1 } as any;
        const fakeClient2 = { id: 2 } as any;
        const store1 = players(undefined, {
            type: ACTION.JOIN,
            payload: fakeClient1,
        });
        const snapshot1 = Set(store1);
        const store2 = players(store1, {
            type: ACTION.JOIN,
            payload: fakeClient2,
        });
        const snapshot2 = Set(store1);
        expect(store1).not.toBe(store2);
        expect(store1).toEqual(snapshot1);
        expect(snapshot2).toEqual(snapshot1);
    });
});
