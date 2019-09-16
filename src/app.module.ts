import { Module } from '@nestjs/common';
import { StoreModule } from './store/store.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { EventModule } from './event/event.module';
import { PlayerModule } from './player/player.module';
import { ChatModule } from './chat/chat.module';
import { GameModule } from './game/game.module';

@Module({
    imports: [
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', 'static'),
        }),
        StoreModule,
        PlayerModule,
        EventModule,
        ChatModule,
        GameModule,
    ],
})
export class AppModule {}
