import {
    SubscribeMessage,
    WebSocketGateway,
    OnGatewayDisconnect,
    WsResponse,
    OnGatewayInit,
} from '@nestjs/websockets';
import { Client } from '../types';
import { ConnectionStore } from './connection.store';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { createWsMessage } from '../utils/createWsMessage';
@WebSocketGateway()
export class ConnectionGateway implements OnGatewayDisconnect, OnGatewayInit {
    constructor(private readonly connectionStore: ConnectionStore) {}

    @SubscribeMessage('join')
    join(client: Client, name: any) {
        client.name = name;
        this.connectionStore.addClient(client);
    }

    afterInit() {
        this.connectionStore.connectedClient$
            .pipe(
                tap(clients => {
                    const names = clients.map(c => c.name);
                    const message = createWsMessage('connected', names);
                    clients.forEach(c => c.send(message));
                }),
            )
            .subscribe();
    }

    handleDisconnect(client: Client) {
        this.connectionStore.removeClient(client);
    }
}
