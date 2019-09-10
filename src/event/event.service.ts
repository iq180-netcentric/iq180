import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';
import { SocketClient, WebSocketEvent } from './event.type';
import { PlayerInfo } from '../models/player';
import { ChatMessage } from '../models/chatMessage';
import { OUT_EVENT, ConnectedEvent, NewPlayerInfoEvent } from './out-events';
import { IN_EVENT } from './in-events';

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
export const emitEvent = ({ event, data, client }: EmitEvent) =>
    client.send(JSON.stringify({ event, data }));

@Injectable()
export class EventService {
    receiveEvent$ = new Subject<WebSocketEvent>();

    emitEvent$ = new Subject<EmitEvent>();

    constructor() {
        this.emitEvent$.subscribe(emitEvent);
    }

    receiveEvent(client: SocketClient, event: IN_EVENT, data?: any) {
        this.receiveEvent$.next({ client, event, data });
    }

    emitEvent = <T>(event: string) => (input: EmitMessage<T>) => {
        this.emitEvent$.next({ event, ...input });
    };

    broadcastEvent = <T>(event: string) => ({
        data,
        clients,
    }: BroadcastMessage<T>) => {
        clients.forEach(client => this.emitEvent(event)({ data, client }));
    };

    broadcastCurrentPlayers = this.broadcastEvent<PlayerInfo[]>(
        OUT_EVENT.CONNECTED,
    );

    sendNewPlayerInfo = this.emitEvent<PlayerInfo>(OUT_EVENT.PLAYER_INFO);

    broadcastChatMessage = this.broadcastEvent<ChatMessage>(
        OUT_EVENT.CHAT_MESSAGE,
    );
}
