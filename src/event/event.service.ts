import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';
import { SocketClient } from '../types';
import { PlayerInfo } from '../models/player';
import { OUT_EVENT, ConnectedEvent, NewPlayerInfoEvent } from './out-events';

export interface SendEvent<T = any> {
    event: string;
    data: T;
    client: SocketClient;
}

export type SendMessage<T> = Omit<SendEvent<T>, 'event'>;
export interface BroadcastEvent<T = any> {
    event: string;
    data: T;
    clients: SocketClient[];
}

export type BroadcastMessage<T> = Omit<BroadcastEvent<T>, 'event'>;

export const sendEvent = ({ event, data, client }: SendEvent) =>
    client.send(JSON.stringify({ event, data }));

@Injectable()
export class EventService {
    newMessage$ = new Subject<SendEvent>();

    constructor() {
        this.newMessage$.subscribe(sendEvent);
    }

    sendMessage(msg: SendEvent) {
        this.newMessage$.next(msg);
    }

    broadcastMessage({ event, data, clients }: BroadcastEvent) {
        clients.forEach(client => this.sendMessage({ event, data, client }));
    }

    broadcastCurrentPlayers(input: BroadcastMessage<ConnectedEvent>) {
        this.broadcastMessage({ event: OUT_EVENT.CONNECTED, ...input });
    }

    sendNewPlayerInfo(input: SendMessage<NewPlayerInfoEvent>) {
        this.sendMessage({ event: OUT_EVENT.PLAYER_INFO, ...input });
    }
}
