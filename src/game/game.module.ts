import { Module } from '@nestjs/common';
import { ConnectionGateway } from './connection.gateway';
import { ConnectionStore } from './connection.store';

@Module({
    providers: [ConnectionGateway, ConnectionStore],
})
export class GameModule {}
