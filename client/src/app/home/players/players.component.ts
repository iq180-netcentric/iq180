import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import {
  WebSocketService,
  filterEvent
} from 'src/app/core/service/web-socket.service';
import { WebSocketIncomingEvent } from 'src/app/core/models/web-socket.model';

@Component({
  selector: 'app-players',
  templateUrl: './players.component.html',
  styleUrls: ['./players.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlayersComponent implements OnInit {
  players$ = this.socket.connection.pipe(
    filterEvent(WebSocketIncomingEvent.connected)
  );

  constructor(private socket: WebSocketService) {
    this.socket.connection
      .pipe(filterEvent(WebSocketIncomingEvent.connected))
      .subscribe(console.log);
  }

  ngOnInit() {}
}
