import { Injectable } from '@nestjs/common';
import { RoomStore } from './room.store';
import { SocketClient } from '../types';
import * as uuidv4 from 'uuid/v4';
import { PlayerInfo, Player } from '../models/player';
import { map, withLatestFrom } from 'rxjs/operators';
import { JoinEvent, OUT_EVENT } from '../event/events';
import { Subject, merge } from 'rxjs';
import {
    EventService,
    BroadcastMessage,
    SendMessage,
} from '../event/event.service';
@Injectable()
export class RoomService {
    constructor(
        private readonly roomStore: RoomStore,
        eventService: EventService,
    ) {
        this.removePlayer$.subscribe(i => roomStore.removePlayer(i));
        this.addPlayer$.subscribe(i => roomStore.addPlayer(i));
        this.broadcastCurrentPlayers$.subscribe(i =>
            eventService.broadcastMessage(i),
        );
        this.sendNewPlayerInfo$.subscribe(i => eventService.sendMessage(i));
    }

    onlinePlayers$ = this.roomStore.store$.pipe(
        map(players => Array.from(players)),
    );

    playerToAdd$ = new Subject<[SocketClient, JoinEvent]>();

    addPlayer$ = this.playerToAdd$.pipe(
        map(
            ([client, input]): Player => {
                const id = uuidv4();
                const playerInfo: PlayerInfo = {
                    id,
                    ready: false,
                    ...input,
                };
                return { client, playerInfo };
            },
        ),
    );

    sendNewPlayerInfo$ = this.addPlayer$.pipe(
        map(
            (player): SendMessage => ({
                event: OUT_EVENT.PLAYER_INFO,
                data: player.playerInfo,
                client: player.client,
            }),
        ),
    );

    addPlayer(client: SocketClient, input: JoinEvent) {
        this.playerToAdd$.next([client, input]);
    }

    playerToRemove$ = new Subject<SocketClient>();

    removePlayer$ = this.playerToRemove$.pipe(
        withLatestFrom(this.roomStore.store$),
        map(([client, store]) => store.find(p => p.client == client)),
    );

    removePlayer(client: SocketClient) {
        this.playerToRemove$.next(client);
    }

    broadcastCurrentPlayers$ = merge(this.addPlayer$, this.removePlayer$).pipe(
        withLatestFrom(this.onlinePlayers$),
        map(
            ([, players]): BroadcastMessage => ({
                event: OUT_EVENT.CONNECTED,
                data: players.map(p => p.playerInfo),
                clients: players.map(p => p.client),
            }),
        ),
    );
}
