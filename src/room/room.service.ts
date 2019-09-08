import { Injectable } from '@nestjs/common';
import { RoomStore } from './room.store';
import { JoinRoom } from '../game/game.interface';
import { SocketClient } from '../types';
import * as uuidv4 from 'uuid/v4';
import { Player } from '../models/player';
import { map } from 'rxjs/operators';

@Injectable()
export class RoomService {
    constructor(private readonly roomStore: RoomStore) {}

    onlinePlayers$ = this.roomStore.store$.pipe(
        map(players => Array.from(players)),
    );

    addClient(client: SocketClient, input: JoinRoom) {
        const id = uuidv4();
        const info: Player = {
            id,
            ...input,
        };
        client.info = info;
        this.roomStore.addPlayer(client);
    }

    removePlayer(client: SocketClient) {
        this.roomStore.removePlayer(client);
    }
}
