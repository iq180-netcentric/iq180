import { Test, TestingModule } from '@nestjs/testing';
import { PlayerStore } from './player.store';
import { StoreModule } from '../store/store.module';
import { EventModule } from '../event/event.module';

describe('Players Store', () => {
    let store: PlayerStore;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [StoreModule, EventModule],
            providers: [PlayerStore],
        }).compile();

        store = module.get<PlayerStore>(PlayerStore);
    });

    it('should be defined', () => {
        expect(store).toBeDefined();
    });
});
