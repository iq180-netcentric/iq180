import { SocketClient } from '../types';
import { WsResponse } from '@nestjs/websockets';

export const createWsResponse = (event: string, data: any): WsResponse => ({
    event,
    data,
});

export const createWsMessage = (event: string, data: any) =>
    JSON.stringify(createWsResponse(event, data));

export const sendEvent = (event: string, data: any) => (client: SocketClient) =>
    client.send(createWsMessage(event, data));

export const broadcastEvent = (
    event: string,
    data: any,
    clients: SocketClient[],
) => clients.forEach(sendEvent(event, data));
