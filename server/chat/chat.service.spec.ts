import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from './chat.service';
import { EventModule } from '../event/event.module';
import { PlayerModule } from '../player/player.module';

describe('ChatService', () => {
    let service: ChatService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [EventModule, PlayerModule],
            providers: [ChatService],
        }).compile();

        service = module.get<ChatService>(ChatService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
