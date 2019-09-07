import { connectionReducer } from '../game/connection.store';
import { combineReducers } from 'redux';
const allReducers = {
    connections: connectionReducer,
};
export const reducer = combineReducers(allReducers);
