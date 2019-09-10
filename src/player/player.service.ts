import { Injectable } from '@nestjs/common';
import { PlayerStore, EditInput } from './player.store';
import { SocketClient } from '../types';
import * as uuidv4 from 'uuid/v4';
import { PlayerInfo, Player } from '../models/player';
import { map, withLatestFrom } from 'rxjs/operators';
import { JoinEvent, OUT_EVENT, EditEvent } from '../event/events';
import { Subject, merge } from 'rxjs';
import {
    EventService,
    BroadcastMessage,
    SendMessage,
} from '../event/event.service';
@Injectable()
export class PlayerService {
    constructor(
        private readonly playerStore: PlayerStore,
        eventService: EventService,
    ) {
        this.removePlayer$.subscribe(i => playerStore.removePlayer(i));
        this.addPlayer$.subscribe(i => playerStore.addPlayer(i));
        this.broadcastCurrentPlayers$.subscribe(i =>
            eventService.broadcastMessage(i),
        );
        this.editPlayer$.subscribe(i => playerStore.editPlayer(i));
        this.sendNewPlayerInfo$.subscribe(i => eventService.sendMessage(i));
    }

    private onlinePlayers$ = this.playerStore.store$.pipe(
        map(players => Array.from(players)),
    );

    private playerToAdd$ = new Subject<[SocketClient, JoinEvent]>();

    private addPlayer$ = this.playerToAdd$.pipe(
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

    private sendNewPlayerInfo$ = this.addPlayer$.pipe(
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

    private playerToRemove$ = new Subject<SocketClient>();

    private removePlayer$ = this.playerToRemove$.pipe(
        withLatestFrom(this.playerStore.store$),
        map(([client, store]) => store.find(p => p.client == client)),
    );

    removePlayer(client: SocketClient) {
        this.playerToRemove$.next(client);
    }

    private editPlayer$ = new Subject<EditInput>();

    editPlayer(client: SocketClient, input: EditEvent) {
        this.editPlayer$.next({ client, input });
    }

    private broadcastCurrentPlayers$ = this.onlinePlayers$.pipe(
        map(
            (players): BroadcastMessage => ({
                event: OUT_EVENT.CONNECTED,
                data: players.map(p => p.playerInfo),
                clients: players.map(p => p.client),
            }),
        ),
    );
}
