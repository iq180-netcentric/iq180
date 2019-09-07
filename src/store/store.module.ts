import { Module, Global } from '@nestjs/common';
import { store } from './store';
import { StoreService } from './store.service';

@Global()
@Module({
    providers: [
        {
            provide: 'STORE',
            useValue: store,
        },
        StoreService,
    ],
    exports: [StoreService],
})
export class StoreModule {}
