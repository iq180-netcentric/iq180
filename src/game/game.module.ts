import { Module } from '@nestjs/common';
import { ConnectionGateway } from './connection.gateway';
import { GameService } from './game.service';

@Module({
  providers: [ConnectionGateway, GameService],
})
export class GameModule {}
