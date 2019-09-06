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
