import { Injectable } from '@nestjs/common';
import { PlayerStore } from './player.store';
import * as uuidv4 from 'uuid/v4';
import { PlayerInfo, Player } from '../models/player';
import { map, withLatestFrom } from 'rxjs/operators';
import { JoinEvent, EditEvent, IN_EVENT } from '../event/in-events';
import { merge } from 'rxjs';
import { EventService } from '../event/event.service';
import { filterEvent } from '../event/event.utils';
@Injectable()
export class PlayerService {
    constructor(
        private readonly playerStore: PlayerStore,
        private readonly eventService: EventService,
    ) {
        this.removePlayer$.subscribe(i => playerStore.removePlayer(i));
        this.addPlayer$.subscribe(i => playerStore.addPlayer(i));
        this.broadcastCurrentPlayers$.subscribe(i =>
            eventService.broadcastCurrentPlayers(i),
        );
        this.editPlayer$.subscribe(i => playerStore.editPlayer(i));
        this.sendNewPlayerInfo$.subscribe(i =>
            eventService.sendNewPlayerInfo(i),
        );
    }

    currentPlayers$ = this.playerStore.store$.pipe(
        map(players => players.toArray()),
    );

    broadcastCurrentPlayers$ = this.currentPlayers$.pipe(
        map(players => ({
            data: players.map(p => p.playerInfo),
            clients: players.map(p => p.client),
        })),
    );

    private addPlayer$ = this.eventService.receiveEvent$.pipe(
        filterEvent<JoinEvent>(IN_EVENT.JOIN),
        map(
            ({ client, data }): Player => {
                const id = uuidv4();
                const playerInfo: PlayerInfo = {
                    id,
                    ready: false,
                    ...data,
                };
                return { client, playerInfo };
            },
        ),
    );

    private removePlayer$ = this.eventService.receiveEvent$.pipe(
        filterEvent(IN_EVENT.LEAVE),
        withLatestFrom(this.playerStore.store$),
        map(([{ client }, store]) => store.find(p => p.client == client)),
    );

    private editPlayer$ = this.eventService.receiveEvent$.pipe(
        filterEvent<EditEvent>(IN_EVENT.EDIT),
        withLatestFrom(this.playerStore.store$),
        map(
            ([{ client, data }, players]): Player => {
                const player = players.find(p => p.client === client);
                return {
                    ...player,
                    playerInfo: { ...player.playerInfo, ...data },
                };
            },
        ),
    );

    private sendNewPlayerInfo$ = merge(this.addPlayer$, this.editPlayer$).pipe(
        map(player => ({
            data: player.playerInfo,
            client: player.client,
        })),
    );
}
