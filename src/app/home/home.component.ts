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
    distinctUntilChanged,
    distinctUntilKeyChanged,
    startWith,
} from 'rxjs/operators';
import { StateService, AppEventType } from '../core/service/state.service';
import { GameQuestion, GameMode } from '../core/models/game/game.model';
import { GameEventType } from './game-field/game-state.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
    currentPlayer$: Observable<Player> = this.authService.player$;
    selectedPlayer$ = this.stateService.selectedPlayer$;
    isCurrentPlayer$ = combineLatest([
        this.currentPlayer$,
        this.selectedPlayer$,
    ]).pipe(
        tap(console.log),
        map(([c, s]) => c && s && c.id === s.id),
    );

    players$ = this.socket
        .listenFor<Player[]>(WebSocketIncomingEvent.players)
        .pipe(
            withLatestFrom(
                this.socket
                    .listenFor<{ id: string; score: number }[]>(
                        WebSocketIncomingEvent.startRound,
                    )
                    .pipe(startWith([])),
            ),
            map(([players, playingPlayers]) => {
                return players.map(player => {
                    const scorePlayer = playingPlayers.find(
                        p => p.id === player.id,
                    );
                    return scorePlayer
                        ? { ...player, score: scorePlayer.score }
                        : player;
                });
            }),
        );
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
    welcomeModalInstance$ = new BehaviorSubject<NzModalRef>(undefined);

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
        this.socket
            .listenFor<Player[]>(WebSocketIncomingEvent.startGame)
            .pipe(takeUntil(this.destroy$))
            .subscribe(players => {
                this.stateService.sendEvent({
                    type: AppEventType.START_GAME,
                    payload: {
                        info: {
                            mode: GameMode.multiPlayer,
                        },
                        players,
                    },
                });
            });
        this.socket
            .listenFor<any>(WebSocketIncomingEvent.startTurn)
            .pipe(
                takeUntil(this.destroy$),
                withLatestFrom(this.currentPlayer$, this.players$),
            )
            .subscribe(([args, player, players]) => {
                const { currentPlayer, question, expectedAnswer } = args;
                if (player.id === currentPlayer) {
                    this.stateService.sendEvent({
                        type: GameEventType.START_TURN,
                        payload: {
                            currentPlayer: player,
                            question,
                            expectedAnswer,
                        },
                    });
                } else {
                    this.stateService.sendEvent({
                        type: GameEventType.START_TURN,
                        payload: {
                            currentPlayer: players.find(
                                p => p.id === currentPlayer,
                            ),
                        },
                    });
                }
            });
    }

    selectPlayer(player: Player) {
        combineLatest(this.currentGame$)
            .pipe(take(1))
            .subscribe(([game]) => {
                if (game.mode === GameMode.singlePlayer) {
                    this.stateService.sendEvent({
                        type: AppEventType.SELECT_PLAYER,
                        payload: player,
                    });
                }
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
                    },
                });
                this.stateService.sendEvent({
                    type: GameEventType.START_ROUND,
                    payload: player,
                });
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

    startMultiplayer() {
        this.socket.emit({
            event: WebSocketOutgoingEvent.startGame,
            data: null,
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
