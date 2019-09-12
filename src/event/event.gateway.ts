import {
    SubscribeMessage,
    WebSocketGateway,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import {
    IN_EVENT,
    JoinEvent,
    EditEvent,
    InChatMessageEvent,
} from './in-events';
import { EventService } from './event.service';
import { SocketClient } from './event.type';

@WebSocketGateway()
export class EventGateway implements OnGatewayDisconnect {
    constructor(private readonly eventService: EventService) {}

    @SubscribeMessage(IN_EVENT.JOIN)
    join(client: SocketClient, input: JoinEvent) {
        this.eventService.receiveEvent(client, IN_EVENT.JOIN, input);
    }

    @SubscribeMessage(IN_EVENT.LEAVE)
    leave(client: SocketClient) {
        this.eventService.receiveEvent(client, IN_EVENT.LEAVE);
    }

    @SubscribeMessage(IN_EVENT.EDIT)
    edit(client: SocketClient, input: EditEvent) {
        this.eventService.receiveEvent(client, IN_EVENT.EDIT, input);
    }

    @SubscribeMessage(IN_EVENT.CHAT_MESSAGE)
    chatMessage(client: SocketClient, input: InChatMessageEvent) {
        this.eventService.receiveEvent(client, IN_EVENT.CHAT_MESSAGE, input);
    }

    @SubscribeMessage(IN_EVENT.READY)
    ready(client: SocketClient) {
        this.eventService.receiveEvent(client, IN_EVENT.READY);
    }

    @SubscribeMessage(IN_EVENT.NOT_READY)
    notReady(client: SocketClient) {
        this.eventService.receiveEvent(client, IN_EVENT.NOT_READY);
    }
    handleDisconnect(client: SocketClient) {
        this.eventService.receiveEvent(client, IN_EVENT.LEAVE);
    }
}
