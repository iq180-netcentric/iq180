import { Injectable } from '@nestjs/common';
import { PlayerStore, isInRoom, PlayerMap } from './player.store';
import { PlayerInfo, Player } from '../models/player';
import {
    map,
    withLatestFrom,
    share,
    filter,
    tap,
    pluck,
    distinctUntilChanged,
} from 'rxjs/operators';
import { JoinEvent, EditEvent, IN_EVENT, ReadyEvent } from '../event/in-events';
import { merge } from 'rxjs';
import { EventService } from '../event/event.service';
import { ReceiveEvent, SocketClient } from '../event/event.type';
import {
    editPlayerAction,
    removePlayerAction,
    addPlayerAction,
} from './player.action';
import uuid from 'uuidv4';

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
        this.broadcastOnlinePlayers$.subscribe(i =>
            eventService.broadcastOnlinePlayers(i),
        );
        this.sendNewPlayerInfo$.subscribe(i =>
            eventService.sendNewPlayerInfo(i),
        );
    }

    onlinePlayers$ = this.playerStore.store$;

    private broadcastOnlinePlayers$ = this.onlinePlayers$.pipe(
        map(players => players.toIndexedSeq().toArray()),
        map(players => {
            const data: PlayerInfo[] = [];
            const clients: SocketClient[] = [];
            for (const { client, ...rest } of players) {
                data.push(rest);
                clients.push(client);
            }
            return {
                data,
                clients,
            };
        }),
    );

    private addPlayer$ = this.eventService
        .listenFor<JoinEvent>(IN_EVENT.JOIN)
        .pipe(
            withLatestFrom(this.onlinePlayers$),
            filter(
                ([{ client }, players]) =>
                    players.find(player => player.client === client) ===
                    undefined,
            ),
            pluck(0),
            map(
                ({ client, data }): Player => {
                    const id = uuid();
                    const player: Player = {
                        id,
                        ready: false,
                        ...data,
                        client,
                    };
                    return player;
                },
            ),
            tap(player => (player.client.id = player.id)),
            share(),
        );

    private addPlayerAction$ = this.addPlayer$.pipe(map(addPlayerAction));

    private removePlayer$ = this.eventService
        .listenFor(IN_EVENT.LEAVE)
        .pipe(map(({ client }) => client.id));

    private removePlayerAction$ = this.removePlayer$.pipe(
        map(removePlayerAction),
    );

    private editPlayer$ = this.eventService
        .listenFor<EditEvent>(IN_EVENT.EDIT)
        .pipe(
            withLatestFrom(this.onlinePlayers$),
            isInRoom(),
        );

    private ready$ = this.eventService
        .listenFor<ReadyEvent>(IN_EVENT.READY)
        .pipe(
            withLatestFrom(this.onlinePlayers$),
            isInRoom(),
            map(
                ([event, players]): [ReceiveEvent, PlayerMap] => [
                    { ...event, data: { ready: event.data } },
                    players,
                ],
            ),
        );

    private editPlayerInfo$ = merge(this.editPlayer$, this.ready$).pipe(
        map(
            ([{ client, data }, players]): Player => {
                const player = players.get(client.id);
                return {
                    ...player,
                    ...data,
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
        map(({ client, ...info }) => ({
            data: info,
            client,
        })),
    );
}
