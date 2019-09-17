import { IN_EVENT } from './in-events';

export interface SocketClient extends WebSocket {
    id: string;
}

export interface ReceiveEvent<T = any> {
    client: SocketClient;
    event: IN_EVENT;
    data: T;
}

export interface EmitMessage<T = any> {
    data: T;
    client: SocketClient;
}
export interface EmitEvent<T = any> extends EmitMessage<T> {
    event: string;
}
export interface BroadcastMessage<T = any> {
    data: T;
    clients: SocketClient[];
}

export interface BroadcastEvent<T = any> extends BroadcastMessage<T> {
    event: string;
}
