import { Injectable } from '@nestjs/common';
import { PlayerService } from '../player/player.service';
import { EventService, BroadcastMessage } from '../event/event.service';
import { SocketClient } from '../types';
import { Subject } from 'rxjs';
import { withLatestFrom, map } from 'rxjs/operators';
import { PlayerStore } from '../player/player.store';
import { ChatMessage } from '../models/chatMessage';

@Injectable()
export class ChatService {
    constructor(
        private readonly playerService: PlayerService,
        eventService: EventService,
    ) {
        this.chatMessage$.subscribe(i => eventService.broadcastChatMessage(i));
    }

    private newMessage$ = new Subject<{
        message: string;
        timestamp: string;
        client: SocketClient;
    }>();

    private chatMessage$ = this.newMessage$.pipe(
        withLatestFrom(this.playerService.currentPlayers$),
        map(
            ([{ client, ...rest }, players]): BroadcastMessage<ChatMessage> => {
                const sender = players.find(p => p.client === client)
                    .playerInfo;
                const data = { sender, ...rest };
                return { data, clients: players.map(p => p.client) };
            },
        ),
    );

    chatMessage(client: SocketClient, message: string) {
        const timestamp = Date();
        this.newMessage$.next({ message, timestamp, client });
    }
}
