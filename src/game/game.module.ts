import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { RoomModule } from '../room/room.module';

@Module({
    imports: [RoomModule],
    providers: [GameGateway],
})
export class GameModule {}
