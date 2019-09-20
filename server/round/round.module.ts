import { Module } from '@nestjs/common';
import { RoundService } from './round.service';
import { EventModule } from '../event/event.module';
import { StoreModule } from '../store/store.module';
import { GameModule } from '../game/game.module';
import { RoundStore } from './round.store';

@Module({
    imports: [EventModule, StoreModule, GameModule],
    providers: [RoundService, RoundStore],
})
export class RoundModule {}
