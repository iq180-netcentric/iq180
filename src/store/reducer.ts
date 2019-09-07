import { connectionsReducer } from '../game/connection.store';
import { combineReducers } from 'redux';
const allReducers = {
    connections: connectionsReducer,
};
export const reducer = combineReducers(allReducers);
