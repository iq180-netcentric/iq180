import { players } from '../player/player.store';
import { combineReducers } from 'redux';
const allReducers = {
    players,
};
export const reducer = combineReducers(allReducers);
