import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';
import { SocketClient } from '../types';

export interface SendMessage {
    event: string;
    data: any;
    client: SocketClient;
}

export interface BroadcastMessage {
    event: string;
    data: any;
    clients: SocketClient[];
}

export const sendEvent = ({ event, data, client }: SendMessage) =>
    client.send(JSON.stringify({ event, data }));

@Injectable()
export class EventService {
    newMessage$ = new Subject<SendMessage>();

    constructor() {
        this.newMessage$.subscribe(sendEvent);
    }

    sendMessage(msg: SendMessage) {
        this.newMessage$.next(msg);
    }

    broadcastMessage({ event, data, clients }: BroadcastMessage) {
        clients.forEach(client => this.sendMessage({ event, data, client }));
    }
}
