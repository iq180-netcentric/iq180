import {
    Component,
    OnInit,
    ChangeDetectionStrategy,
    ViewChild,
    OnDestroy,
    Inject,
} from '@angular/core';
import { WebSocketService } from 'src/app/core/service/web-socket.service';
import { Subject, of } from 'rxjs';
import { map, scan, tap, filter, delay, takeUntil } from 'rxjs/operators';
import {
    WebSocketOutgoingEvent,
    WebSocketIncomingEvent,
} from 'src/app/core/models/web-socket.model';
import { ChatMessage } from 'src/app/core/models/chat.model';
import {
    CdkVirtualScrollViewport,
    VIRTUAL_SCROLL_STRATEGY,
    FixedSizeVirtualScrollStrategy,
    VirtualScrollStrategy,
} from '@angular/cdk/scrolling';
import { FormGroup, FormBuilder } from 'ngx-strongly-typed-forms';
import { Validators } from '@angular/forms';

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatComponent implements OnInit, OnDestroy {
    @ViewChild(CdkVirtualScrollViewport, { static: true })
    viewPort: CdkVirtualScrollViewport;

    messages$ = this.socket
        .listenFor<ChatMessage>(WebSocketIncomingEvent.chatMessage)
        .pipe(
            map(d => {
                return {
                    ...d,
                    timestamp: new Date(d.timestamp),
                };
            }),
            scan<ChatMessage, ChatMessage[]>((acc, cur) => acc.concat(cur), []),
        );

    destroy$ = new Subject();

    chatForm: FormGroup<{ message: string }>;

    constructor(private socket: WebSocketService, formBuilder: FormBuilder) {
        this.chatForm = formBuilder.group<{ message: string }>({
            message: ['', [Validators.required]],
        });
        this.messages$
            .pipe(
                takeUntil(this.destroy$),
                delay(100),
            )
            .subscribe(e =>
                this.viewPort.scrollToIndex(e.length - 1, 'smooth'),
            );
    }

    ngOnInit() {}

    sendChat() {
        of(this.chatForm)
            .pipe(
                tap(form => form.markAsDirty()),
                filter(form => form.valid),
                map(form => form.value),
            )
            .subscribe(form => {
                this.socket.emit({
                    event: WebSocketOutgoingEvent.chatMessage,
                    data: form.message,
                });
                this.chatForm.reset();
            });
    }
    ngOnDestroy() {
        this.destroy$.next();
    }
}
