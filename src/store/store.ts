import { createStore, Store } from 'redux';
import { reducer } from './reducer';
import { Action } from '../types';

export const store = createStore(reducer);

type ExtractState<T> = T extends Store<infer R> ? R : any;

export type AppState = ExtractState<typeof store>;
