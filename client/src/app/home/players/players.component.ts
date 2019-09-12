import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import {
    WebSocketService,
    filterEvent,
} from 'src/app/core/service/web-socket.service';
import { WebSocketIncomingEvent } from 'src/app/core/models/web-socket.model';
import { Player } from 'src/app/core/models/player.model';

@Component({
    selector: 'app-players',
    templateUrl: './players.component.html',
    styleUrls: ['./players.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayersComponent implements OnInit {
    players$ = this.socket.observable.pipe(
        filterEvent<Player[]>(WebSocketIncomingEvent.connected),
    );

    constructor(private socket: WebSocketService) {}

    ngOnInit() {}
}
