import { Injectable } from '@nestjs/common';
import {
    PlayerStore,
    isInRoom,
    addPlayerAction,
    removePlayerAction,
    editPlayerAction,
} from './player.store';
import * as uuidv4 from 'uuid/v4';
import { PlayerInfo, Player } from '../models/player';
import { map, withLatestFrom } from 'rxjs/operators';
import { JoinEvent, EditEvent, IN_EVENT, ReadyEvent } from '../event/in-events';
import { merge } from 'rxjs';
import { EventService } from '../event/event.service';
import { WebSocketEvent } from '../event/event.type';
@Injectable()
export class PlayerService {
    constructor(
        private readonly playerStore: PlayerStore,
        private readonly eventService: EventService,
    ) {
        merge(
            this.addPlayerAction$,
            this.editPlayerAction$,
            this.removePlayerAction$,
        ).subscribe(i => playerStore.dispatch(i));
        this.broadcastCurrentPlayers$.subscribe(i =>
            eventService.broadcastCurrentPlayers(i),
        );
        this.sendNewPlayerInfo$.subscribe(i =>
            eventService.sendNewPlayerInfo(i),
        );
    }

    currentPlayers$ = this.playerStore.store$.pipe(
        map(players => players.toArray()),
    );

    private broadcastCurrentPlayers$ = this.currentPlayers$.pipe(
        map(players => ({
            data: players.map(p => p.playerInfo),
            clients: players.map(p => p.client),
        })),
    );

    private addPlayer$ = this.eventService
        .listenFor<JoinEvent>(IN_EVENT.JOIN)
        .pipe(
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

    private addPlayerAction$ = this.addPlayer$.pipe(map(addPlayerAction));

    private removePlayer$ = this.eventService.listenFor(IN_EVENT.LEAVE).pipe(
        withLatestFrom(this.currentPlayers$),
        isInRoom(),
        map(([{ client }, store]) => store.find(p => p.client == client)),
    );

    private removePlayerAction$ = this.removePlayer$.pipe(
        map(removePlayerAction),
    );

    private editPlayer$ = this.eventService
        .listenFor<EditEvent>(IN_EVENT.EDIT)
        .pipe(
            withLatestFrom(this.currentPlayers$),
            isInRoom(),
        );

    private ready$ = this.eventService
        .listenFor<ReadyEvent>(IN_EVENT.READY)
        .pipe(
            withLatestFrom(this.currentPlayers$),
            isInRoom(),
            map(
                ([{ data, ...rest }, players]): [WebSocketEvent, Player[]] => [
                    { ...rest, data: { ready: data } },
                    players,
                ],
            ),
        );

    private editPlayerInfo$ = merge(this.editPlayer$, this.ready$).pipe(
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

    private editPlayerAction$ = this.editPlayerInfo$.pipe(
        map(editPlayerAction),
    );

    private sendNewPlayerInfo$ = merge(
        this.addPlayer$,
        this.editPlayerInfo$,
    ).pipe(
        map(player => ({
            data: player.playerInfo,
            client: player.client,
        })),
    );
}
