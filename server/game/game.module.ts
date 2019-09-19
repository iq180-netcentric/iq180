import { Module } from '@nestjs/common';
import { GameStore } from './game.store';
import { GameService } from './game.service';
import { PlayerModule } from '../player/player.module';
import { StoreModule } from '../store/store.module';
import { EventModule } from '../event/event.module';

@Module({
    imports: [PlayerModule, StoreModule, EventModule],
    providers: [GameStore, GameService],
})
export class GameModule {}
