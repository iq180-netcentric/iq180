export interface Action<Type = any, Payload = any> {
    type: Type;
    payload?: Payload;
}

export type ActionType<T extends (...args: any) => any> = ReturnType<
    T
> extends Action<infer R, infer S>
    ? Action<R, S>
    : Action;

export type Reducer<State = any, ActionType = any> = (
    state: State,
    action: ActionType,
) => State;
