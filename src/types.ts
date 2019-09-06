import { Subject, BehaviorSubject } from 'rxjs';
import { scan } from 'rxjs/operators';

export interface Client extends WebSocket {
    [key: string]: any;
}

export interface Event<T = any> {
    event: string;
    data: T;
}

export interface Action<Type = string, Payload = any> {
    type: Type;
    payload: Payload;
}

export abstract class Store<StoreType = any, Type = string, Payload = any> {
    protected action$ = new BehaviorSubject<Action<Type, Payload>>(undefined);
    protected dispatch(action: Action<Type, Payload>) {
        this.action$.next(action);
    }
    protected reducer: (
        store: StoreType,
        action: Action<Type, Payload>,
    ) => StoreType;
}
