import { players } from '../player/player.store';
import { combineReducers } from 'redux';
import { admins } from '../admin/admin.store';
const allReducers = {
    players,
    admins,
};
export const reducer = combineReducers(allReducers);
