import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { GameModule } from './game/game.module';

@Module({
  imports: [GameModule],
  providers: [AppService],
})
export class AppModule {}
