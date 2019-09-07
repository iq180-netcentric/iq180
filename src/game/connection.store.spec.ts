import { Test, TestingModule } from '@nestjs/testing';
import { ConnectionStore, reducer, ACTION } from './connection.store';

describe('Connection Store', () => {
    let store: ConnectionStore;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ConnectionStore],
        }).compile();

        store = module.get<ConnectionStore>(ConnectionStore);
    });

    it('should be defined', () => {
        expect(store).toBeDefined();
    });
    test('reducer should not mutate', () => {
        const fakeClient1 = { id: 1 } as any;
        const fakeClient2 = { id: 2 } as any;
        const store1 = reducer(new Set(), {
            type: ACTION.JOIN,
            payload: fakeClient1,
        });
        const snapshot1 = new Set(store1);
        const store2 = reducer(store1, {
            type: ACTION.JOIN,
            payload: fakeClient2,
        });
        const snapshot2 = new Set(store1);
        expect(store1).not.toBe(store2);
        expect(store1).toEqual(snapshot1);
        expect(snapshot2).toEqual(snapshot1);
    });
});
