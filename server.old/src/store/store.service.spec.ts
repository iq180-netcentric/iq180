import { Test, TestingModule } from '@nestjs/testing';
import { StoreService } from './store.service';
import { store } from './store';

describe('StoreService', () => {
    let service: StoreService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                {
                    provide: 'STORE',
                    useValue: store,
                },
                StoreService,
            ],
        }).compile();

        service = module.get<StoreService>(StoreService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
