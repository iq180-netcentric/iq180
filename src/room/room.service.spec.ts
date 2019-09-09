import { Test, TestingModule } from '@nestjs/testing';
import { RoomService } from './room.service';
import { StoreModule } from '../store/store.module';
import { RoomStore } from './room.store';
import { EventModule } from '../event/event.module';

describe('RoomService', () => {
    let service: RoomService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [StoreModule, EventModule],
            providers: [RoomService, RoomStore],
        }).compile();

        service = module.get<RoomService>(RoomService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
