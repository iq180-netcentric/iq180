import {
    SubscribeMessage,
    WebSocketGateway,
    OnGatewayDisconnect,
    OnGatewayInit,
} from '@nestjs/websockets';
import { SocketClient } from '../types';
import { IN_EVENT } from './event.constants';
import { JoinRoom } from './game.interface';
import { RoomService } from '../room/room.service';
import { GameService } from './game.service';
@WebSocketGateway()
export class GameGateway implements OnGatewayDisconnect, OnGatewayInit {
    constructor(
        private readonly roomService: RoomService,
        private readonly gameService: GameService,
    ) {}

    @SubscribeMessage(IN_EVENT.JOIN)
    join(client: SocketClient, input: JoinRoom) {
        this.roomService.addClient(client, input);
    }

    @SubscribeMessage(IN_EVENT.LEAVE)
    leave(client: SocketClient) {
        this.roomService.removePlayer(client);
    }

    afterInit() {
        this.gameService.broadcastCurrentPlayer.subscribe();
    }

    handleDisconnect(client: SocketClient) {
        this.roomService.removePlayer(client);
    }
}
