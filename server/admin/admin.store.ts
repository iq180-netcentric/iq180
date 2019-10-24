import { Injectable } from '@nestjs/common';
import { StoreService } from '../store/store.service';
import { Map } from 'immutable';
import { Action, Reducer } from '../store/store.type';
import { ReceiveEvent, SocketClient } from '../event/event.type';
import { filter } from 'rxjs/operators';

export type Admins = SocketClient[];
export const enum AdminActions {
    ADD_ADMIN = 'ADD_ADMIN',
    REMOVE_ADMIN = 'REMOVE_ADMIN',
}
export type AddAdmin = Action<AdminActions.ADD_ADMIN, SocketClient>;
export type RemoveAdmin = Action<AdminActions.REMOVE_ADMIN, SocketClient>;
type AdminAction = AddAdmin | RemoveAdmin;
export const admins: Reducer<Admins, AdminAction> = (state = [], action) => {
    switch (action.type) {
        case AdminActions.REMOVE_ADMIN: {
            const { payload } = action;
            return state.filter(c => c !== payload);
        }
        case AdminActions.ADD_ADMIN: {
            const { payload } = action;
            return state.concat(payload);
        }
        default:
            return state;
    }
};

export const isAdmin = <T = any>() =>
    filter<[ReceiveEvent<T>, Admins]>(([{ client }, admins]) =>
        admins.includes(client),
    );

@Injectable()
export class AdminStore {
    constructor(private readonly storeService: StoreService) {}

    readonly store$ = this.storeService.select('admins');

    dispatch = (i: AdminAction) => this.storeService.dispatch(i);
}
