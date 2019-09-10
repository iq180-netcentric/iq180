import { Injectable } from '@nestjs/common';
import { PlayerStore } from './player.store';
import { SocketClient } from '../types';
import * as uuidv4 from 'uuid/v4';
import { PlayerInfo, Player } from '../models/player';
import { map, withLatestFrom } from 'rxjs/operators';
import { JoinEvent, EditEvent } from '../event/in-events';
import { Subject, merge } from 'rxjs';
import { EventService } from '../event/event.service';
@Injectable()
export class PlayerService {
    constructor(
        private readonly playerStore: PlayerStore,
        eventService: EventService,
    ) {
        this.removePlayer$.subscribe(i => playerStore.removePlayer(i));
        this.addPlayer$.subscribe(i => playerStore.addPlayer(i));
        this.currentPlayers$.subscribe(i =>
            eventService.broadcastCurrentPlayers(i),
        );
        this.editPlayer$.subscribe(i => playerStore.editPlayer(i));
        this.sendNewPlayerInfo$.subscribe(i =>
            eventService.sendNewPlayerInfo(i),
        );
    }

    private currentPlayers$ = this.playerStore.store$.pipe(
        map(players => players.toArray()),
        map(players => ({
            data: players.map(p => p.playerInfo),
            clients: players.map(p => p.client),
        })),
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

    private playerToEdit$ = new Subject<[SocketClient, EditEvent]>();

    private editPlayer$ = this.playerToEdit$.pipe(
        withLatestFrom(this.playerStore.store$),
        map(
            ([[client, input], players]): Player => {
                const player = players.find(p => p.client === client);
                return {
                    ...player,
                    playerInfo: { ...player.playerInfo, ...input },
                };
            },
        ),
    );

    editPlayer(client: SocketClient, input: EditEvent) {
        this.playerToEdit$.next([client, input]);
    }

    private sendNewPlayerInfo$ = merge(this.addPlayer$, this.editPlayer$).pipe(
        map(player => ({
            data: player.playerInfo,
            client: player.client,
        })),
    );
}
