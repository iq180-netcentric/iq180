import { Module } from '@nestjs/common';
import { StoreModule } from '../store/store.module';
import { RoomStore } from './player.store';
import { PlayerService } from './player.service';
import { EventModule } from '../event/event.module';

@Module({
    imports: [StoreModule, EventModule],
    providers: [RoomStore, PlayerService],
    exports: [PlayerService],
})
export class PlayerModule {}
