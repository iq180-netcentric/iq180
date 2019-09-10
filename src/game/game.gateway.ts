import {
    SubscribeMessage,
    WebSocketGateway,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { SocketClient } from '../types';
import { IN_EVENT, JoinEvent, EditEvent } from '../event/events';
import { PlayerService } from '../player/player.service';
@WebSocketGateway()
export class GameGateway implements OnGatewayDisconnect {
    constructor(private readonly roomService: PlayerService) {}

    @SubscribeMessage(IN_EVENT.JOIN)
    join(client: SocketClient, input: JoinEvent) {
        this.roomService.addPlayer(client, input);
    }

    @SubscribeMessage(IN_EVENT.LEAVE)
    leave(client: SocketClient) {
        this.roomService.removePlayer(client);
    }

    @SubscribeMessage(IN_EVENT.EDIT)
    edit(client: SocketClient, input: EditEvent) {
        this.roomService.editPlayer(client, input);
    }

    handleDisconnect(client: SocketClient) {
        this.roomService.removePlayer(client);
    }
}
