import {
    SubscribeMessage,
    WebSocketGateway,
    OnGatewayDisconnect,
    WsResponse,
} from '@nestjs/websockets';
import { Client } from '../types';
import { ConnectionStore } from './connection.store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
@WebSocketGateway()
export class ConnectionGateway implements OnGatewayDisconnect {
    constructor(private readonly connectionStore: ConnectionStore) {}

    @SubscribeMessage('join')
    join(client: Client, name: any): Observable<WsResponse> {
        client.name = name;
        this.connectionStore.addClient(client);
        return this.connectionStore.connectedClient$.pipe(
            map(c => ({ event: 'connectedClients', data: c })),
        );
    }

    handleDisconnect(client: Client) {
        this.connectionStore.removeClient(client);
    }
}
