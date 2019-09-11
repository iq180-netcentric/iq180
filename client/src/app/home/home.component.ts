import { Component, OnInit } from '@angular/core';
import {
    WebSocketService,
    filterEvent,
} from '../core/service/web-socket.service';
import {
    WebSocketOutgoingEvent,
    WebSocketIncomingEvent,
} from '../core/models/web-socket.model';
import { NzModalService } from 'ng-zorro-antd';
import { WelcomeDialogComponent } from './welcome-dialog/welcome-dialog.component';
import { AuthService } from '../core/service/auth.service';
import { Player } from '../core/models/player.model';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
    currentPlayer$: Observable<Player> = this.authService.player$;

    constructor(
        private socket: WebSocketService,
        private modalService: NzModalService,
        private authService: AuthService,
    ) {
        this.socket.observable.subscribe();
    }

    ngOnInit() {
        if (!this.authService.player$.value) {
            this.showWelcomeModal();
        } else {
            const player: Player = this.authService.player$.getValue();
            this.socket.emit({
                event: WebSocketOutgoingEvent.join,
                data: player,
            });
        }
    }

    logout() {
        this.showWelcomeModal(true);
    }

    showWelcomeModal(edit: boolean = false): void {
        const modal = this.modalService.create({
            nzTitle: 'Welcome to IQ180',
            nzContent: WelcomeDialogComponent,
            nzClosable: false,
            nzComponentParams: {
                edit,
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
        });
        const instance = modal.getContentComponent();
    }
}
