import { Module } from '@nestjs/common';
import { EventModule } from '../event/event.module';
import { PlayerModule } from '../player/player.module';
import { GameModule } from '../game/game.module';
import { AdminService } from './admin.service';
import { AdminStore } from './admin.store';
import { StoreModule } from '../store/store.module';

@Module({
    imports: [EventModule, GameModule, StoreModule, PlayerModule],
    providers: [AdminService, AdminStore],
})
export class AdminModule {}
