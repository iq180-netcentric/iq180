import { Module } from '@nestjs/common';
import { StoreModule } from '../store/store.module';
import { RoomStore } from './room.store';
import { RoomService } from './room.service';

@Module({
    imports: [StoreModule],
    providers: [RoomStore, RoomService],
    exports: [RoomService],
})
export class RoomModule {}
