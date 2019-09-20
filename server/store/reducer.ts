import { players } from '../player/player.store';
import { combineReducers } from 'redux';
import { game } from '../game/game.store';
import { round } from '../round/round.store';
const allReducers = {
    players,
    game,
    round,
};
export const reducer = combineReducers(allReducers);
