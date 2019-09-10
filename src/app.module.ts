import { Module } from '@nestjs/common';
import { StoreModule } from './store/store.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { EventModule } from './event/event.module';
import { PlayerModule } from './player/player.module';
import { ChatModule } from './chat/chat.module';

@Module({
    imports: [
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', 'static'),
        }),
        StoreModule,
        PlayerModule,
        EventModule,
        ChatModule,
    ],
})
export class AppModule {}
