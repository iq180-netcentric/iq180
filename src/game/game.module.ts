import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { PlayerModule } from '../player/player.module';
import { ChatModule } from '../chat/chat.module';

@Module({
    imports: [PlayerModule, ChatModule],
    providers: [GameGateway],
})
export class GameModule {}
