import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { GameModule } from './game/game.module';
import { StoreModule } from './store/store.module';

@Module({
  imports: [GameModule, StoreModule],
  providers: [AppService],
})
export class AppModule {}
