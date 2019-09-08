import { Injectable, Inject } from '@angular/core';
import {
  WebSocketSubjectConfig,
  WebSocketSubject,
  webSocket
} from 'rxjs/webSocket';
import { ENV } from './environment.service';
import {
  WebSocketEvent,
  WebSocketIncomingEvent
} from '../models/web-socket.model';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  connection: WebSocketSubject<WebSocketEvent<any>>;

  constructor(@Inject(ENV) env: any) {
    this.connection = webSocket<WebSocketEvent<any>>(env.socketUrl);
  }
}

export const filterEvent = (event: WebSocketIncomingEvent) => (
  source: Observable<WebSocketEvent<any>>
) => {
  return source.pipe(
    filter(evt => evt.event === event),
    map(e => {
      switch (e.event) {
        case WebSocketIncomingEvent.connected:
          return e.data as [string];
        default:
          return e.data;
      }
    })
  );
};
