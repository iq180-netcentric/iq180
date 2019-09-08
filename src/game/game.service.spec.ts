import { Test, TestingModule } from '@nestjs/testing';
import { GameService } from './game.service';
import { RoomModule } from '../room/room.module';

describe('GameService', () => {
    let service: GameService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [RoomModule],
            providers: [GameService],
        }).compile();

        service = module.get<GameService>(GameService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
