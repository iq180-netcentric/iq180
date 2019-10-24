import { Module } from '@nestjs/common';
import { AngularUniversalModule } from '@nestjs/ng-universal';
import { join } from 'path';
import { EventModule } from './event/event.module';
import { PlayerModule } from './player/player.module';
import { ChatModule } from './chat/chat.module';
import { GameModule } from './game/game.module';
import { StoreModule } from './store/store.module';
import { RoundModule } from './round/round.module';
import { AdminModule } from './admin/admin.module';

@Module({
    imports: [
        AngularUniversalModule.forRoot({
            viewsPath: join(process.cwd(), 'dist/browser'),
            bundle: require('../server/main'),
            liveReload: process.env.NODE_ENV !== 'production',
        }),
        StoreModule,
        PlayerModule,
        EventModule,
        ChatModule,
        GameModule,
        RoundModule,
        AdminModule
    ],
})
export class AppModule {}
