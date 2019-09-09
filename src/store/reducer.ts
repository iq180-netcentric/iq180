import { room } from '../room/room.store';
import { combineReducers } from 'redux';
const allReducers = {
    room,
};
export const reducer = combineReducers(allReducers);
