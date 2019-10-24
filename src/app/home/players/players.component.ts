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
import { withLatestFrom, map, startWith } from 'rxjs/operators';
import { combineLatest } from 'rxjs';

@Component({
    selector: 'app-players',
    templateUrl: './players.component.html',
    styleUrls: ['./players.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayersComponent implements OnInit {
    players$ = combineLatest([
        this.socket.listenFor<Player[]>(WebSocketIncomingEvent.players),
        this.socket.listenFor<{ id: string; score: number }[]>(
            WebSocketIncomingEvent.startRound,
        ),
    ]).pipe(
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
    @Output() selectPlayer = new EventEmitter<Player>();
    @Input() selectedPlayer: Player;

    constructor(private socket: WebSocketService) {}

    ngOnInit() {}
}
