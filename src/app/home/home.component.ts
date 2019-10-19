import { Component, OnInit, OnDestroy } from '@angular/core';
import { WebSocketService } from '../core/service/web-socket.service';
import {
    WebSocketOutgoingEvent,
    WebSocketIncomingEvent,
} from '../core/models/web-socket.model';
import { NzModalService, NzModalRef } from 'ng-zorro-antd';
import { WelcomeDialogComponent } from './welcome-dialog/welcome-dialog.component';
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
} from 'rxjs/operators';
import { StateService, AppEventType } from '../core/service/state.service';
import { GameMode } from '../core/models/game/game.model';
import { GameEventType } from './game-field/game-state.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
    currentPlayer$: Observable<Player> = this.authService.player$;
    selectedPlayer$ = new BehaviorSubject<Player>(undefined);

    destroy$ = new Subject();

    ready$ = this.stateService.ready$;
    currentGame$ = this.stateService.game$;
    welcomeModalInstance$ = new BehaviorSubject<NzModalRef>(undefined);

    constructor(
        private socket: WebSocketService,
        private modalService: NzModalService,
        private authService: AuthService,
        private stateService: StateService,
    ) {}

    ngOnInit() {
        this.stateService.state$.subscribe(console.log);
        this.authService.player$
            .pipe(
                take(1),
                takeUntil(this.destroy$),
            )
            .subscribe(player => {
                if (!player) {
                    this.showWelcomeModal();
                } else {
                    this.socket.emit({
                        event: WebSocketOutgoingEvent.join,
                        data: player,
                    });
                }
            });
        this.socket
            .listenFor<Player>(WebSocketIncomingEvent.playerInfo)
            .pipe(withLatestFrom(this.selectedPlayer$))
            .subscribe(([newPlayer, selectedPlayer]) => {
                if (selectedPlayer && selectedPlayer.id === newPlayer.id) {
                    this.selectedPlayer$.next(newPlayer);
                }
                this.authService.setPlayer(newPlayer);
            });
        this.ready$.pipe(takeUntil(this.destroy$)).subscribe(ready => {
            this.socket.emit({
                event: WebSocketOutgoingEvent.ready,
                data: ready,
            });
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
        this.stateService.sendEvent({
            type: AppEventType.START_GAME,
            payload: {
                mode: GameMode.singlePlayer,
            },
        });
    }

    ngOnDestroy() {
        this.destroy$.next();
    }

    logout() {
        this.showWelcomeModal(true);
    }

    exitGame() {
        this.stateService.sendEvent({
            type: AppEventType.END_GAME,
        });
    }
    showWelcomeModal(edit: boolean = false): void {
        combineLatest(this.authService.player$, this.authService.remember$)
            .pipe(take(1))
            .subscribe(([player, remember]) => {
                const modal = this.modalService.create({
                    nzTitle: 'Welcome to IQ180',
                    nzContent: WelcomeDialogComponent,
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
                    nzOnOk: () => this.welcomeModalInstance$.next(undefined),
                });
                this.welcomeModalInstance$.next(modal);
            });
    }
}
