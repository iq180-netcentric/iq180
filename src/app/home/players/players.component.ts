import {
    Component,
    OnInit,
    ChangeDetectionStrategy,
    EventEmitter,
    Output,
    Input,
} from '@angular/core';
import { WebSocketService } from 'src/app/core/service/web-socket.service';
import { WebSocketIncomingEvent } from 'src/app/core/models/web-socket.model';
import { Player } from 'src/app/core/models/player.model';

@Component({
    selector: 'app-players',
    templateUrl: './players.component.html',
    styleUrls: ['./players.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayersComponent implements OnInit {
    players$ = this.socket.listenFor<Player[]>(WebSocketIncomingEvent.players);
    @Output() selectPlayer = new EventEmitter<Player>();
    @Input() selectedPlayer: Player;

    constructor(private socket: WebSocketService) {}

    ngOnInit() {}
}
