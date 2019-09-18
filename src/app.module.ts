import { Module } from '@nestjs/common';
import { StoreModule } from './store/store.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { EventModule } from './event/event.module';
import { PlayerModule } from './player/player.module';
import { ChatModule } from './chat/chat.module';
import { GameModule } from './game/game.module';
import { AngularUniversalModule } from '@nestjs/ng-universal';

@Module({
    imports: [
        AngularUniversalModule.forRoot({
            viewsPath: join(process.cwd(), 'dist/browser'),
            bundle: require('./../dist/client/server/main.js'),
        }),
        StoreModule,
        PlayerModule,
        EventModule,
        ChatModule,
        GameModule,
    ],
})
export class AppModule {}
