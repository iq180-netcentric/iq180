import { BehaviorSubject } from 'rxjs';
import { Action } from '../types';

export class Store<Type = string, Payload = any> {
    protected action$ = new BehaviorSubject<Action<Type, Payload>>(undefined);
    protected dispatch(action: Action<Type, Payload>) {
        this.action$.next(action);
    }
}
