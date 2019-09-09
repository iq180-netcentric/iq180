import { Module } from '@nestjs/common';
import { GameModule } from './game/game.module';
import { StoreModule } from './store/store.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { RoomModule } from './room/room.module';

@Module({
    imports: [
        GameModule,
        StoreModule,
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', 'static'),
        }),
        RoomModule,
    ],
})
export class AppModule {}
