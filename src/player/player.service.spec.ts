import { Test, TestingModule } from '@nestjs/testing';
import { PlayerService } from './player.service';
import { StoreModule } from '../store/store.module';
import { RoomStore } from './player.store';
import { EventModule } from '../event/event.module';

describe('PlayerService', () => {
    let service: PlayerService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [StoreModule, EventModule],
            providers: [PlayerService, RoomStore],
        }).compile();

        service = module.get<PlayerService>(PlayerService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
