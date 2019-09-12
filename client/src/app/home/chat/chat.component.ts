import {
    Component,
    OnInit,
    ChangeDetectionStrategy,
    ViewChild,
} from '@angular/core';
import {
    WebSocketService,
    filterEvent,
} from 'src/app/core/service/web-socket.service';
import { interval, BehaviorSubject, Subject, of } from 'rxjs';
import { map, scan, concatMap, toArray, tap } from 'rxjs/operators';
import {
    WebSocketOutgoingEvent,
    WebSocketIncomingEvent,
} from 'src/app/core/models/web-socket.model';
import { ChatMessage } from 'src/app/core/models/chat.model';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatComponent implements OnInit {
    @ViewChild(CdkVirtualScrollViewport, { static: true })
    viewPort: CdkVirtualScrollViewport;

    messages$ = this.socket.observable.pipe(
        filterEvent<ChatMessage>(WebSocketIncomingEvent.chatMessage),
        map(d => {
            return {
                ...d,
                timestamp: new Date(d.timestamp),
            };
        }),
        scan<ChatMessage, ChatMessage[]>((acc, cur) => acc.concat(cur), []),
        tap(e => this.viewPort.scrollToIndex(e.length)),
    );

    destroy$ = new Subject();
    constructor(private socket: WebSocketService) {}

    ngOnInit() {
        interval(1000).subscribe(e =>
            this.socket.emit({
                event: WebSocketOutgoingEvent.chatMessage,
                data: `hi ${e}`,
            }),
        );
    }
}
