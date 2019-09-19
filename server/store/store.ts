import { createStore, Store } from 'redux';
import { reducer } from './reducer';
import devToolsEnhancer from 'remote-redux-devtools';

const devTools = () => {
    try {
        return devToolsEnhancer({
            name: 'Android app',
            realtime: process.env.NODE_ENV === 'development',
            hostname: 'localhost',
            port: 3002,
            suppressConnectErrors: false,
        });
    } catch (error) {
        console.log(error);
    }
};

export const store = createStore(reducer, devTools());

type ExtractState<T> = T extends Store<infer R> ? R : any;

export type AppState = ExtractState<typeof store>;
