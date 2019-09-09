import { Injectable, Inject } from '@angular/core';
import {
    WebSocketSubjectConfig,
    WebSocketSubject,
    webSocket,
} from 'rxjs/webSocket';
import { ENV } from './environment.service';
import {
    WebSocketEvent,
    WebSocketIncomingEvent,
    WebSocketOutgoingEvent,
} from '../models/web-socket.model';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { Player } from '../models/player.model';

@Injectable({
    providedIn: 'root',
})
export class WebSocketService {
    connection: WebSocketSubject<WebSocketEvent<any>>;

    constructor(@Inject(ENV) env: any) {
        const url = env.production
            ? `wss://${window.location.hostname}/`
            : env.socketUrl;
        this.connection = webSocket<WebSocketEvent<any>>(url);
    }

    emit(event: { event: WebSocketOutgoingEvent; data: any }) {
        this.connection.next(event);
    }
}

export const filterEvent = (event: WebSocketIncomingEvent) => (
    source: Observable<WebSocketEvent<any>>,
) => {
    return source.pipe(
        filter(evt => evt.event === event),
        map(e => {
            switch (e.event) {
                case WebSocketIncomingEvent.connected:
                    return e.data as Player[];
                default:
                    return e.data;
            }
        }),
    );
};
