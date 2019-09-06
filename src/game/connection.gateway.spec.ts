import { Test, TestingModule } from '@nestjs/testing';
import { ConnectionGateway } from './connection.gateway';

describe('ConnectionGateway', () => {
  let gateway: ConnectionGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConnectionGateway],
    }).compile();

    gateway = module.get<ConnectionGateway>(ConnectionGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
