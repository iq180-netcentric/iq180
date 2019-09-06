import {
    SubscribeMessage,
    WebSocketGateway,
    OnGatewayConnection,
    OnGatewayInit,
    OnGatewayDisconnect,
    WebSocketServer,
    WsResponse,
} from '@nestjs/websockets';
import { Client } from '../types';
import { GameService } from './game.service';
import { Server } from 'ws';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
@WebSocketGateway()
export class ConnectionGateway
    implements OnGatewayConnection, OnGatewayInit, OnGatewayDisconnect {
    constructor(private readonly gameService: GameService) {}

    @WebSocketServer()
    server: Server;

    @SubscribeMessage('join')
    join(client: Client, name: any): Observable<WsResponse> {
        client.name = name;
        this.gameService.addClient(client);
        return this.gameService.store$.pipe(
            map(c => ({ event: 'asd', data: [...c].map(i => i.name) })),
        );
    }

    handleConnection(client: Client) {}

    afterInit() {}

    handleDisconnect(client: Client) {
        this.gameService.removeClient(client);
    }
}
