import { Injectable } from '@nestjs/common';
import { PlayerService } from '../player/player.service';
import { EventService } from '../event/event.service';
import { withLatestFrom, map } from 'rxjs/operators';
import { ChatMessage } from '../models/chatMessage';
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
                    const { client: c, ...sender } = players.get(client.id);
                    const timestamp = new Date().toISOString();
                    const clients = players
                        .toIndexedSeq()
                        .map(p => p.client)
                        .toArray();
                    return {
                        data: { sender, timestamp, message: data },
                        clients,
                    };
                },
            ),
        );
}
