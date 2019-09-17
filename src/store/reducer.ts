import { players } from '../player/player.store';
import { combineReducers } from 'redux';
import { game } from '../game/game.store';
const allReducers = {
    players,
    game,
};
export const reducer = combineReducers(allReducers);
