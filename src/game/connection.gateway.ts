import {
    SubscribeMessage,
    WebSocketGateway,
    OnGatewayDisconnect,
    WsResponse,
} from '@nestjs/websockets';
import { Client } from '../types';
import { GameService } from './game.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
@WebSocketGateway()
export class ConnectionGateway implements OnGatewayDisconnect {
    constructor(private readonly gameService: GameService) {}

    @SubscribeMessage('join')
    join(client: Client, name: any): Observable<WsResponse> {
        client.name = name;
        this.gameService.addClient(client);
        return this.gameService.connectedClient$.pipe(
            map(c => ({ event: 'connectedClients', data: c })),
        );
    }

    handleDisconnect(client: Client) {
        this.gameService.removeClient(client);
    }
}
