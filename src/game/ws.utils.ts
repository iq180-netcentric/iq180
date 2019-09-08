import { SocketClient } from '../types';

export const createWsMessage = (event: string, data: any) =>
    JSON.stringify({
        event,
        data,
    });

export const sendEvent = (event: string, data: any) => (client: SocketClient) =>
    client.send(createWsMessage(event, data));

export const broadcastEvent = (
    event: string,
    data: any,
    clients: SocketClient[],
) => clients.forEach(sendEvent(event, data));
