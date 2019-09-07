import { Test, TestingModule } from '@nestjs/testing';
import { ConnectionGateway } from './connection.gateway';
import { ConnectionStore } from './connection.store';
import { StoreModule } from '../store/store.module';

describe('ConnectionGateway', () => {
    let gateway: ConnectionGateway;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [StoreModule],
            providers: [ConnectionGateway, ConnectionStore],
        }).compile();

        gateway = module.get<ConnectionGateway>(ConnectionGateway);
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });
});
