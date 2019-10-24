import { Component, OnInit, OnDestroy } from '@angular/core';
import { WebSocketService } from '../core/service/web-socket.service';
import {
    WebSocketOutgoingEvent,
    WebSocketIncomingEvent,
} from '../core/models/web-socket.model';
import { NzModalService, NzModalRef } from 'ng-zorro-antd';
import { AdminLoginComponent } from './admin-login/admin-login.component';
import { AuthService } from '../core/service/auth.service';
import { Player } from '../core/models/player.model';
import {
    Observable,
    BehaviorSubject,
    Subject,
    combineLatest,
    from,
} from 'rxjs';

import {
    take,
    takeUntil,
    filter,
    tap,
    map,
    withLatestFrom,
    switchMap,
    pluck,
    distinctUntilChanged,
    distinctUntilKeyChanged,
} from 'rxjs/operators';
import { StateService, AppEventType } from '../core/service/state.service';
import { GameMode } from '../core/models/game/game.model';

@Component({
    selector: 'app-admin-loading',
    templateUrl: './admin.component.html',
    styleUrls: ['./admin.component.scss'],
})
export class AdminComponent implements OnInit, OnDestroy {
    currentPlayer$: Observable<Player> = this.authService.player$;
    selectedPlayer$ = this.stateService.selectedPlayer$;

    destroy$ = new Subject();

    gameReady$ = this.socket
        .listenFor<Player[]>(WebSocketIncomingEvent.players)
        .pipe(
            map(players => {
                return players.filter(p => p.ready).length >= 2 ? true : false;
            }),
        );

    ready$ = this.stateService.ready$;
    currentGame$ = this.stateService.game$;
    adminLoginInstance$ = new BehaviorSubject<NzModalRef>(undefined);

    constructor(
        private socket: WebSocketService,
        private modalService: NzModalService,
        private authService: AuthService,
        private stateService: StateService,
    ) {}

    ngOnInit() {
        this.authService.player$
            .pipe(
                take(1),
                takeUntil(this.destroy$),
            )
            .subscribe(player => {
                if (!player) {
                    this.showLoginModal
            ();
                } else {
                    this.socket.emit({
                        event: WebSocketOutgoingEvent.join,
                        data: player,
                    });
                }
            });
        this.socket
            .listenFor<Player>(WebSocketIncomingEvent.playerInfo)
            .pipe(
                withLatestFrom(this.selectedPlayer$),
                takeUntil(this.destroy$),
            )
            .subscribe(([newPlayer, selectedPlayer]) => {
                if (selectedPlayer && selectedPlayer.id === newPlayer.id) {
                    this.stateService.sendEvent({
                        type: AppEventType.SELECT_PLAYER,
                        payload: newPlayer,
                    });
                }
                this.authService.setPlayer(newPlayer);
            });
        this.ready$
            .pipe(
                distinctUntilChanged(),
                takeUntil(this.destroy$),
            )
            .subscribe(ready => {
                this.socket.emit({
                    event: WebSocketOutgoingEvent.ready,
                    data: ready,
                });
            });
    }

    selectPlayer(player: Player) {
        this.stateService.sendEvent({
            type: AppEventType.SELECT_PLAYER,
            payload: player,
        });
    }
    ready() {
        combineLatest(this.currentPlayer$)
            .pipe(take(1))
            .subscribe(([player]) => {
                this.stateService.sendEvent({
                    type: AppEventType.READY,
                    payload: player.ready,
                });
            });
    }

    singlePlayer() {
        combineLatest(this.currentPlayer$)
            .pipe(take(1))
            .subscribe(([player]) => {
                this.stateService.sendEvent({
                    type: AppEventType.START_GAME,
                    payload: {
                        info: {
                            mode: GameMode.singlePlayer,
                        },
                        player,
                    },
                });
            });
    }

    ngOnDestroy() {
        this.destroy$.next();
    }

    logout() {
        this.showLoginModal
(true);
    }

    exitGame() {
        this.stateService.sendEvent({
            type: AppEventType.END_GAME,
        });
    }

    startMultiplayer() {
        this.socket.emit({
            event: WebSocketOutgoingEvent.startGame,
            data: null,
        });
    }
    showLoginModal(edit: boolean = false): void {
        combineLatest(this.authService.player$, this.authService.remember$)
            .pipe(take(1))
            .subscribe(([player, remember]) => {
                const modal = this.modalService.create({
                    nzTitle: 'Welcome to IQ180',
                    nzContent: AdminLoginComponent,
                    nzClosable: edit,
                    nzComponentParams: {
                        edit,
                        player,
                        remember,
                    },
                    nzFooter: [
                        {
                            label: 'GO!',
                            type: 'primary',
                            onClick: instance => {
                                instance.submitUser();
                            },
                        },
                    ],
                    nzMaskClosable: edit,
                    nzOnOk: () => this.adminLoginInstance$.next(undefined),
                });
                this.adminLoginInstance$.next(modal);
            });
    }
}
