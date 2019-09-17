import { createAction } from '../store/store.service';
import { Player } from '../models/player';
import { ActionType } from '../store/store.type';

export const enum ACTION {
    ADD = 'ADD',
    REMOVE = 'REMOVE',
    EDIT = 'EDIT',
}

export const addPlayerAction = createAction<ACTION.ADD, Player>(ACTION.ADD);
export const editPlayerAction = createAction<ACTION.EDIT, Player>(ACTION.EDIT);
export const removePlayerAction = createAction<ACTION.REMOVE, string>(
    ACTION.REMOVE,
);

export type AddPlayer = ActionType<typeof addPlayerAction>;
export type EditPlayer = ActionType<typeof editPlayerAction>;
export type RemovePlayer = ActionType<typeof removePlayerAction>;

export type PlayerAction = AddPlayer | EditPlayer | RemovePlayer;
