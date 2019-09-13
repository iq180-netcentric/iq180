import { Injectable } from '@nestjs/common';
import { PlayerService } from '../player/player.service';
import { EventService } from '../event/event.service';
import { withLatestFrom, map } from 'rxjs/operators';
import { ChatMessage } from '../models/chatMessage';
import { filterEvent } from '../event/event.utils';
import { IN_EVENT, InChatMessageEvent } from '../event/in-events';
import { BroadcastMessage } from '../event/event.type';
import { isInRoom } from '../player/player.store';
@Injectable()
export class ChatService {
    constructor(
        private readonly playerService: PlayerService,
        private readonly eventService: EventService,
    ) {
        this.chatMessage$.subscribe(i => eventService.broadcastChatMessage(i));
    }

    private chatMessage$ = this.eventService
        .listenFor<InChatMessageEvent>(IN_EVENT.CHAT_MESSAGE)
        .pipe(
            withLatestFrom(this.playerService.currentPlayers$),
            isInRoom(),
            map(
                ([{ client, data }, players]): BroadcastMessage<
                    ChatMessage
                > => {
                    const sender = players.find(p => p.client === client)
                        .playerInfo;
                    const timestamp = new Date().toISOString();
                    const clients = players.map(p => p.client);
                    return {
                        data: { sender, timestamp, message: data },
                        clients,
                    };
                },
            ),
        );
}
