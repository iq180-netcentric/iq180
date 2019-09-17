import { Module } from '@nestjs/common';
import { StoreModule } from '../store/store.module';
import { PlayerStore } from './player.store';
import { PlayerService } from './player.service';
import { EventModule } from '../event/event.module';

@Module({
    imports: [StoreModule, EventModule],
    providers: [PlayerStore, PlayerService],
    exports: [PlayerService],
})
export class PlayerModule {}
