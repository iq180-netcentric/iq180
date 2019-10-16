import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { PlayerModule } from '../player/player.module';
import { EventModule } from '../event/event.module';
import { GameMachine } from './game.state';

@Module({
    imports: [PlayerModule, EventModule],
    providers: [GameService, GameMachine],
    exports: [GameService],
})
export class GameModule {}
