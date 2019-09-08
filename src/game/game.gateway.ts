import {
    SubscribeMessage,
    WebSocketGateway,
    OnGatewayDisconnect,
    OnGatewayInit,
} from '@nestjs/websockets';
import { SocketClient } from '../types';
import { IN_EVENT, JoinEvent, OUT_EVENT } from './events';
import { RoomService } from '../room/room.service';
import { GameService } from './game.service';
import { createWsMessage } from './ws.utils';
@WebSocketGateway()
export class GameGateway implements OnGatewayDisconnect, OnGatewayInit {
    constructor(
        private readonly roomService: RoomService,
        private readonly gameService: GameService,
    ) {}

    @SubscribeMessage(IN_EVENT.JOIN)
    join(client: SocketClient, input: JoinEvent) {
        const player = this.roomService.addPlayer(client, input);
        return createWsMessage(OUT_EVENT.PLAYER_INFO, player);
    }

    @SubscribeMessage(IN_EVENT.LEAVE)
    leave(client: SocketClient) {
        this.roomService.removePlayer(client);
    }

    afterInit() {
        this.gameService.broadcastCurrentPlayer();
    }

    handleDisconnect(client: SocketClient) {
        this.roomService.removePlayer(client);
    }
}
