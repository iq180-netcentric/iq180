import { players } from '../player/player.store';
import { combineReducers } from 'redux';
import { round } from '../round/round.store';
const allReducers = {
    players,
    round,
};
export const reducer = combineReducers(allReducers);
