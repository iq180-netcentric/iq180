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
import { Observable, interval } from 'rxjs';
import { filter, retryWhen, tap, delay, pluck } from 'rxjs/operators';

export const filterEvent = <T = any>(event: WebSocketIncomingEvent) => (
    source: Observable<WebSocketEvent<any>>,
) => {
    return source.pipe(
        filter((evt: WebSocketEvent<T>) => evt.event === event),
        pluck('data'),
    );
};

@Injectable({
    providedIn: 'root',
})
export class WebSocketService {
    private connection: WebSocketSubject<WebSocketEvent<any>>;

    constructor(@Inject(ENV) env: any) {
        const url = env.production
            ? `wss://${window.location.hostname}/`
            : env.socketUrl;
        this.connection = webSocket<WebSocketEvent<any>>(url);
        interval(30000).subscribe(_ => {
            this.emit({
                event: WebSocketOutgoingEvent.ping,
                data: 'hi',
            });
        });
    }

    get observable() {
        return this.connection.pipe(
            retryWhen(errors =>
                errors.pipe(
                    tap(err => {
                        console.error('Got error', err);
                    }),
                    delay(1000),
                ),
            ),
        );
    }

    listenFor<T>(event: WebSocketIncomingEvent) {
        return this.observable.pipe(filterEvent<T>(event));
    }

    emit(event: { event: WebSocketOutgoingEvent; data: any }) {
        this.connection.next(event);
    }
}
