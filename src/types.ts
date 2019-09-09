export interface SocketClient extends WebSocket {}

export interface Action<Type = any, Payload = any> {
    type: Type;
    payload?: Payload;
}
