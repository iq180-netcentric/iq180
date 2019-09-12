import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';
import {
    SocketClient,
    WebSocketEvent,
    EmitEvent,
    EmitMessage,
    BroadcastMessage,
} from './event.type';
import {
    OUT_EVENT,
    PlayersEvent,
    NewPlayerInfoEvent,
    OutChatMessageEvent,
} from './out-events';
import { IN_EVENT } from './in-events';
import { emitEvent } from './event.utils';

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

    emitEvent = <T>(event: OUT_EVENT) => (input: EmitMessage<T>) => {
        this.emitEvent$.next({ event, ...input });
    };

    broadcastEvent = <T>(event: OUT_EVENT) => ({
        data,
        clients,
    }: BroadcastMessage<T>) => {
        clients.forEach(client => this.emitEvent(event)({ data, client }));
    };

    broadcastCurrentPlayers = this.broadcastEvent<PlayersEvent>(
        OUT_EVENT.PLAYERS,
    );

    sendNewPlayerInfo = this.emitEvent<NewPlayerInfoEvent>(
        OUT_EVENT.PLAYER_INFO,
    );

    broadcastChatMessage = this.broadcastEvent<OutChatMessageEvent>(
        OUT_EVENT.CHAT_MESSAGE,
    );
}
