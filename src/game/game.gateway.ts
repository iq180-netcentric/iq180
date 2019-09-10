import {
    SubscribeMessage,
    WebSocketGateway,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { SocketClient } from '../types';
import {
    IN_EVENT,
    JoinEvent,
    EditEvent,
    InChatMessageEvent,
} from '../event/in-events';
import { PlayerService } from '../player/player.service';
import { ChatService } from '../chat/chat.service';
@WebSocketGateway()
export class GameGateway implements OnGatewayDisconnect {
    constructor(
        private readonly playerService: PlayerService,
        private readonly chatService: ChatService,
    ) {}

    @SubscribeMessage(IN_EVENT.JOIN)
    join(client: SocketClient, input: JoinEvent) {
        this.playerService.addPlayer(client, input);
    }

    @SubscribeMessage(IN_EVENT.LEAVE)
    leave(client: SocketClient) {
        this.playerService.removePlayer(client);
    }

    @SubscribeMessage(IN_EVENT.EDIT)
    edit(client: SocketClient, input: EditEvent) {
        this.playerService.editPlayer(client, input);
    }

    @SubscribeMessage(IN_EVENT.CHAT_MESSAGE)
    chatMessage(client: SocketClient, input: InChatMessageEvent) {
        this.chatService.chatMessage(client, input);
    }

    handleDisconnect(client: SocketClient) {
        this.playerService.removePlayer(client);
    }
}
