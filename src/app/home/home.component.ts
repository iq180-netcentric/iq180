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

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
    currentPlayer$: Observable<Player> = this.authService.player$;
    currentGame$ = new BehaviorSubject<{}>(undefined);
    selectedPlayer$ = new BehaviorSubject<Player>(undefined);

    destroy$ = new Subject();

    welcomeModalInstance$ = new BehaviorSubject<NzModalRef>(undefined);
    constructor(
        private socket: WebSocketService,
        private modalService: NzModalService,
        private authService: AuthService,
    ) {}

    ngOnInit() {
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
            .subscribe(newPlayer => {
                this.authService.setPlayer(newPlayer);
            });
    }

    ngOnDestroy() {
        this.destroy$.next();
    }

    logout() {
        this.showWelcomeModal(true);
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

    singlePlayer() {
        this.currentGame$.next({});
    }

    ready() {
        combineLatest(this.currentPlayer$)
            .pipe(take(1))
            .subscribe(([player]) => {
                this.socket.emit({
                    event: WebSocketOutgoingEvent.ready,
                    data: !player.ready,
                });
            });
    }
}
