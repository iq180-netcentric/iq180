import { WsResponse } from '@nestjs/websockets';
import { IN_EVENT } from './in-events';

export interface SocketClient extends WebSocket {}

export interface WebSocketEvent<T = any> {
    client: SocketClient;
    event: IN_EVENT;
    data: T;
}
