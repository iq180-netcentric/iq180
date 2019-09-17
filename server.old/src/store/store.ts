import { createStore, Store } from 'redux';
import { reducer } from './reducer';
import devToolsEnhancer from 'remote-redux-devtools';

export const store = createStore(
    reducer,
    devToolsEnhancer({
        name: 'Android app',
        realtime: true,
        hostname: 'localhost',
        port: 3002,
        suppressConnectErrors: false,
    }),
);

type ExtractState<T> = T extends Store<infer R> ? R : any;

export type AppState = ExtractState<typeof store>;
