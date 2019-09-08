import { Component, OnInit } from '@angular/core';
import {
  WebSocketService,
  filterEvent
} from '../core/service/web-socket.service';
import {
  WebSocketOutgoingEvent,
  WebSocketIncomingEvent
} from '../core/models/web-socket.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  constructor(private socket: WebSocketService) {}

  ngOnInit() {
    this.socket.connection.next({
      event: WebSocketOutgoingEvent.join,
      data: 'Ham'
    });
  }
}
