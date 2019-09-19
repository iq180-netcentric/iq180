import { Module } from '@nestjs/common';
import { AngularUniversalModule } from '@nestjs/ng-universal';
import { join } from 'path';
import { EventModule } from './event/event.module';
import { PlayerModule } from './player/player.module';
import { ChatModule } from './chat/chat.module';
import { GameModule } from './game/game.module';
import { StoreModule } from './store/store.module';

@Module({
    imports: [
        AngularUniversalModule.forRoot({
            viewsPath: join(process.cwd(), 'dist/browser'),
            bundle: require('../server/main'),
            liveReload: true,
        }),
        StoreModule,
        PlayerModule,
        EventModule,
        ChatModule,
        GameModule,
    ],
})
export class AppModule {}
