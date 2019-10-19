import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { PlayerModule } from '../player/player.module';
import { EventModule } from '../event/event.module';
import { GameMachine } from './game.machine';

@Module({
    imports: [PlayerModule, EventModule],
    providers: [GameService, GameMachine],
    exports: [GameService, GameMachine],
})
export class GameModule {}
