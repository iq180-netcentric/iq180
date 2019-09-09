import { Module } from '@nestjs/common';
import { GameModule } from './game/game.module';
import { StoreModule } from './store/store.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { EventModule } from './event/event.module';
import { PlayerModule } from './player/player.module';

@Module({
    imports: [
        GameModule,
        StoreModule,
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', 'static'),
        }),
        PlayerModule,
        EventModule,
    ],
})
export class AppModule {}
