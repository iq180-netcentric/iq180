import { Module } from '@nestjs/common';
import { StoreModule } from '../store/store.module';
import { RoomStore } from './room.store';
import { RoomService } from './room.service';
import { EventModule } from '../event/event.module';

@Module({
    imports: [StoreModule, EventModule],
    providers: [RoomStore, RoomService],
    exports: [RoomService],
})
export class RoomModule {}
