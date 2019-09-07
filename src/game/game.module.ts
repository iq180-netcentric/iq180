import { Module } from '@nestjs/common';
import { ConnectionGateway } from './connection.gateway';
import { ConnectionStore } from './connection.store';
import { StoreModule } from '../store/store.module';

@Module({
    imports: [StoreModule],
    providers: [ConnectionGateway, ConnectionStore],
})
export class GameModule {}
