import { createAction } from '../store/store.service';
import { Player } from '../models/player';
import { ActionType } from '../store/store.type';

export const enum PLAYER_ACTION {
    ADD = 'ADD',
    REMOVE = 'REMOVE',
    EDIT = 'EDIT',
}

export const addPlayerAction = createAction<PLAYER_ACTION.ADD, Player>(
    PLAYER_ACTION.ADD,
);
export const editPlayerAction = createAction<PLAYER_ACTION.EDIT, Player>(
    PLAYER_ACTION.EDIT,
);
export const removePlayerAction = createAction<PLAYER_ACTION.REMOVE, string>(
    PLAYER_ACTION.REMOVE,
);

export type AddPlayer = ActionType<typeof addPlayerAction>;
export type EditPlayer = ActionType<typeof editPlayerAction>;
export type RemovePlayer = ActionType<typeof removePlayerAction>;

export type PlayerAction = AddPlayer | EditPlayer | RemovePlayer;
