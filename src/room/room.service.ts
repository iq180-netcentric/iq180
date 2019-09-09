import { Injectable } from '@nestjs/common';
import { RoomStore } from './room.store';
import { SocketClient } from '../types';
import * as uuidv4 from 'uuid/v4';
import { PlayerInfo, Player } from '../models/player';
import { map, tap } from 'rxjs/operators';
import { JoinEvent, OUT_EVENT } from '../event/events';
import { Subject, combineLatest } from 'rxjs';
import { sendEvent } from '../event/utils';
@Injectable()
export class RoomService {
    constructor(private readonly roomStore: RoomStore) {
        this.removePlayer$.subscribe(i => roomStore.removePlayer(i));
        this.addPlayer$.subscribe(i => roomStore.addPlayer(i));
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
        tap(({ client, playerInfo }) => {
            sendEvent(OUT_EVENT.PLAYER_INFO, playerInfo)(client);
        }),
    );

    addPlayer(client: SocketClient, input: JoinEvent) {
        this.playerToAdd$.next([client, input]);
    }

    playerToRemove$ = new Subject<SocketClient>();

    removePlayer$ = combineLatest(
        this.playerToRemove$,
        this.roomStore.store$,
    ).pipe(map(([client, store]) => store.find(p => p.client == client)));

    removePlayer(client: SocketClient) {
        this.playerToRemove$.next(client);
    }
}
