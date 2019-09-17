import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { EventModule } from '../event/event.module';
import { PlayerModule } from '../player/player.module';

@Module({
    imports: [EventModule, PlayerModule],
    providers: [ChatService],
    exports: [ChatService],
})
export class ChatModule {}
