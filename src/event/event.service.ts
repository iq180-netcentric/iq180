import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';
import { SocketClient } from '../types';
import { PlayerInfo } from '../models/player';
import { ChatMessage } from '../models/chatMessage';
import { OUT_EVENT, ConnectedEvent, NewPlayerInfoEvent } from './out-events';

export interface SendMessage<T = any> {
    data: T;
    client: SocketClient;
}
export interface SendEvent<T = any> extends SendMessage<T> {
    event: string;
}
export interface BroadcastMessage<T = any> {
    data: T;
    clients: SocketClient[];
}

export interface BroadcastEvent<T = any> extends BroadcastMessage<T> {
    event: string;
}
export const sendEvent = ({ event, data, client }: SendEvent) =>
    client.send(JSON.stringify({ event, data }));

@Injectable()
export class EventService {
    newMessage$ = new Subject<SendEvent>();

    constructor() {
        this.newMessage$.subscribe(sendEvent);
    }

    sendMessage = <T>(event: string) => (input: SendMessage<T>) => {
        this.newMessage$.next({ event, ...input });
    };

    broadcastMessage = <T>(event: string) => ({
        data,
        clients,
    }: BroadcastMessage<T>) => {
        clients.forEach(client => this.sendMessage(event)({ data, client }));
    };

    broadcastCurrentPlayers = this.broadcastMessage<PlayerInfo[]>(
        OUT_EVENT.CONNECTED,
    );

    sendNewPlayerInfo = this.sendMessage<PlayerInfo>(OUT_EVENT.PLAYER_INFO);

    broadcastChatMessage = this.broadcastMessage<ChatMessage>(
        OUT_EVENT.CHAT_MESSAGE,
    );
}
