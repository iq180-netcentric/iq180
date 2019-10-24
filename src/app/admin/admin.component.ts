import {
    Component,
    OnInit,
    ViewChild,
    Inject,
    PLATFORM_ID,
} from '@angular/core';
import { WebSocketService } from '../core/service/web-socket.service';
import { NgTerminal } from 'ng-terminal';
import {
    WebSocketOutgoingEvent,
    WebSocketIncomingEvent,
} from '../core/models/web-socket.model';
import { isPlatformBrowser } from '@angular/common';
import { takeWhile, pluck, map, tap } from 'rxjs/operators';

@Component({
    selector: 'app-admin-loading',
    templateUrl: './admin.component.html',
    styleUrls: ['./admin.component.scss'],
})
export class AdminComponent implements OnInit {
    @ViewChild('term', { static: true }) child: NgTerminal;

    line: string[] = [];
    prompt = '$ ';
    ready = true;
    isLoggedIn = false;
    password: string;

    constructor(
        private socket: WebSocketService,
        @Inject(PLATFORM_ID) private platformId: Object,
    ) {}

    ngOnInit() {
        this.socket.observable.subscribe(console.log);
        this.adminJoin$.subscribe(sucess => {
            console.log(sucess);
            console.log(this.isLoggedIn);
            if (sucess) {
                this.isLoggedIn = true;
                this.println('login successful');
            } else {
                this.println('invalid password');
            }
        });
    }

    get isBrowser() {
        return isPlatformBrowser(this.platformId);
    }
    ngAfterViewInit() {
        // this.invalidate();
        this.child.write(
            'Welcome to Admin console, type password to continue\r\n' +
                this.prompt,
        );
        this.child.keyEventInput.subscribe(e => {
            const ev = e.domEvent;
            const printable = !ev.altKey && !ev.ctrlKey && !ev.metaKey;
            if (this.ready) {
                if (ev.keyCode === 13) {
                    this.child.write('\r\n');
                    this.handleCommand(this.line.join(''));
                    this.line = [];
                    this.child.write(this.prompt);
                } else if (ev.keyCode === 8) {
                    // Do not delete the prompt
                    if (this.child.underlying.buffer.cursorX > 2) {
                        this.child.write('\b \b');
                        this.line.pop();
                    }
                } else if (printable) {
                    this.child.write(e.key);
                    this.line.push(e.key);
                }
            }
        });
    }

    async handleCommand(command: string) {
        this.ready = false;
        if (this.isLoggedIn) {
            const [cmd, ...args] = command.replace(/\s+/, ' ').split(' ');
            switch (cmd) {
                case 'reset':
                    this.socket.emit({
                        event: WebSocketOutgoingEvent.command,
                        data: 'RESET',
                    });
                    this.println(`Ha! reset`);
                    break;
                case 'help':
                    this.println(`Available Commands`);
                    this.println('reset       reset the game');
                    this.println('players     list online players');
                    this.println('game        list game state');
                    // reset       reset the game
                    // players     list online players
                    // game        list game state
                    // `);
                    break;
                default:
                    this.println(
                        `${cmd} : command not found, type help to get help`,
                    );
            }
        } else {
            this.socket.emit({
                event: WebSocketOutgoingEvent.adminJoin,
                data: command,
            });
            // this.password = command;
            // this.println("You're now logged in");
            // this.isLoggedIn = true;
        }
        this.ready = true;
    }

    println(line: string) {
        this.child.write(line + '\r\n');
    }

    adminJoin$ = this.socket.listenFor<boolean>(
        WebSocketIncomingEvent.adminLoggedIn,
    );
}
