import { Injectable } from '@nestjs/common';
import { EventService } from '../event/event.service';
import { IN_EVENT, AdminJoinEvent } from '../event/in-events';
import { GameMachine } from '../game/game.machine';
import { AdminStore, AdminActions, AddAdmin, isAdmin, RemoveAdmin } from './admin.store';
import { filter, map, withLatestFrom } from 'rxjs/operators';
import { merge } from 'rxjs';
import { log } from '../utils';

@Injectable()
export class AdminService {
    constructor(
        private readonly gameMachine: GameMachine,
        private readonly eventService: EventService,
        private readonly adminStore: AdminStore,
    ) {
        merge(this.adminJoin$, this.adminLeave$).subscribe(i => adminStore.dispatch(i));
        this.reset$.subscribe(() => eventService.receiveEvent(null, IN_EVENT.RESET_GAME))
        this.gameState$.subscribe(data => eventService.broadcastGameState(data))
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

    private reset$ = this.eventService.listenFor(IN_EVENT.RESET).pipe(
        withLatestFrom(this.adminStore.store$),
        isAdmin(),
    )

    private gameState$ = this.gameMachine.state$.pipe(
        withLatestFrom(this.adminStore.store$),
        map(([{ event, value }, clients]) => ({ clients, data: { event, value } }))
    )

    private adminLeave$ = this.eventService.listenFor(IN_EVENT.LEAVE).pipe(
        map(({ client }): RemoveAdmin => ({ type: AdminActions.REMOVE_ADMIN, payload: client }))
    )
}
