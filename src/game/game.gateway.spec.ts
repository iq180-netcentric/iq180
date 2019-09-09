import { Test, TestingModule } from '@nestjs/testing';
import { GameGateway } from './game.gateway';
import { RoomModule } from '../room/room.module';
import { GameService } from './game.service';

describe('Game Gateway', () => {
    let gateway: GameGateway;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [RoomModule],
            providers: [GameGateway, GameService],
        }).compile();

        gateway = module.get<GameGateway>(GameGateway);
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });
});
