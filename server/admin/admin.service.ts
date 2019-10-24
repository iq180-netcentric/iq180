import { Injectable } from '@nestjs/common';
import { EventService } from '../event/event.service';
import { IN_EVENT, AdminJoinEvent } from '../event/in-events';
import { GameMachine } from '../game/game.machine';
import {
    AdminStore,
    AdminActions,
    AddAdmin,
    isAdmin,
    RemoveAdmin,
} from './admin.store';
import { filter, map, withLatestFrom, pluck } from 'rxjs/operators';
import { merge } from 'rxjs';
import { AdminLoggedIn, OUT_EVENT } from '../event/out-events';
import { PlayerService } from '../player/player.service';

@Injectable()
export class AdminService {
    constructor(
        private readonly gameMachine: GameMachine,
        private readonly eventService: EventService,
        private readonly adminStore: AdminStore,
        private readonly playerService: PlayerService,
    ) {
        merge(this.adminJoin$, this.adminLeave$).subscribe(i =>
            adminStore.dispatch(i),
        );
        this.reset$.subscribe(() =>
            eventService.receiveEvent(null, IN_EVENT.RESET_GAME),
        );
        merge(this.reset$, this.players$, this.online$).subscribe(data =>
            eventService.emitEvent<string>(OUT_EVENT.RESULT)(data),
        );
        this.gameState$.subscribe(data =>
            eventService.broadcastGameState(data),
        );
        this.adminLoggedIn$.subscribe(event =>
            eventService.emitEvent<AdminLoggedIn>(OUT_EVENT.ADMIN_LOGGED_IN)(
                event,
            ),
        );
    }

    private adminJoin$ = this.eventService
        .listenFor<AdminJoinEvent>(IN_EVENT.ADMIN_JOIN)
        .pipe(
            filter(({ data }) => data === 'SECRET'),
            map(
                ({ client }): AddAdmin => ({
                    type: AdminActions.ADD_ADMIN,
                    payload: client,
                }),
            ),
        );

    private adminLoggedIn$ = this.eventService
        .listenFor<AdminJoinEvent>(IN_EVENT.ADMIN_JOIN)
        .pipe(map(({ data, client }) => ({ client, data: data === 'SECRET' })));

    private command$ = this.eventService
        .listenFor<string>(IN_EVENT.COMMAND)
        .pipe(
            withLatestFrom(this.adminStore.store$),
            isAdmin(),
            pluck(0),
        );

    private reset$ = this.command$.pipe(
        filter(({ data }) => data === 'RESET'),
        map(({ client }) => ({ client, data: 'game has been reset' })),
    );

    private gameState$ = this.gameMachine.state$.pipe(
        withLatestFrom(this.adminStore.store$),
        map(([{ event, value }, clients]) => ({
            clients,
            data: { event, value },
        })),
    );

    private online$ = this.command$.pipe(
        filter(({ data }) => data === 'ONLINE'),
        withLatestFrom(this.playerService.onlinePlayers$),
        map(([{ client }, players]) => ({
            client,
            data: JSON.stringify(
                players
                    .map(({ name, ready }) => ({ name, ready }))
                    .toIndexedSeq()
                    .toArray(),
            ),
        })),
    );

    private players$ = this.command$.pipe(
        filter(({ data }) => data === 'PLAYERS'),
        withLatestFrom(
            this.playerService.onlinePlayers$,
            this.gameMachine.context$,
        ),
        map(([{ client }, online, { players }]) => ({
            client,
            data: JSON.stringify(
                players
                    .map(({ score }, key) => {
                        const { name } = online.get(key);
                        return {
                            name,
                            score,
                        };
                    })
                    .toIndexedSeq()
                    .toArray(),
            ),
        })),
    );

    private adminLeave$ = this.eventService.listenFor(IN_EVENT.LEAVE).pipe(
        map(
            ({ client }): RemoveAdmin => ({
                type: AdminActions.REMOVE_ADMIN,
                payload: client,
            }),
        ),
    );
}
