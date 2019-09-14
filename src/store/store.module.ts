import { Module } from '@nestjs/common';
import { store } from './store';
import { StoreService } from './store.service';

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
