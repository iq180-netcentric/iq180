import { Test, TestingModule } from '@nestjs/testing';
import { ConnectionStore, connectionReducer, ACTION } from './connection.store';
import { Set } from 'immutable';
import { StoreModule } from '../store/store.module';

describe('Connection Store', () => {
    let store: ConnectionStore;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [StoreModule],
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
        const store1 = connectionReducer(undefined, {
            type: ACTION.JOIN,
            payload: fakeClient1,
        });
        const snapshot1 = Set(store1);
        const store2 = connectionReducer(store1, {
            type: ACTION.JOIN,
            payload: fakeClient2,
        });
        const snapshot2 = Set(store1);
        expect(store1).not.toBe(store2);
        expect(store1).toEqual(snapshot1);
        expect(snapshot2).toEqual(snapshot1);
    });
});
