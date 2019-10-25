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

    wrongCount = 0;
    constructor(
        private socket: WebSocketService,
        @Inject(PLATFORM_ID) private platformId: Object,
    ) {}

    ngOnInit() {
        this.socket.observable.subscribe(console.log);
        this.adminJoin$.subscribe(sucess => {
            this.ready = true;
            if (sucess) {
                this.isLoggedIn = true;
                this.println('Login successful');
                this.prompt = 'IQ180-admin$ ';
                this.wrongCount = 0;
            } else {
                if (this.wrongCount === 2) {
                    this.println('Bye, See you later');
                    window.location.href =
                        'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
                } else {
                    this.wrongCount++;
                    this.println('Invalid password');
                }
            }
            this.writePrompt();
        });
        this.commandResult$.subscribe(message => {
            this.ready = true;
            this.println(message);
            this.writePrompt();
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
                } else if (ev.keyCode === 8) {
                    // Do not delete the prompt
                    if (this.child.underlying.buffer.cursorX > 2) {
                        this.child.write('\b \b');
                        this.line.pop();
                    }
                } else if (printable) {
                    this.child.write(this.isLoggedIn ? e.key : '*');
                    this.line.push(e.key);
                }
            }
        });
    }

    command(cmd: string) {
        this.socket.emit({
            event: WebSocketOutgoingEvent.command,
            data: cmd,
        });
    }

    writePrompt() {
        this.child.write(this.prompt);
    }

    async handleCommand(command: string) {
        this.ready = false;
        if (this.isLoggedIn) {
            const [cmd, ...args] = command.replace(/\s+/, ' ').split(' ');
            switch (cmd) {
                case 'reset':
                    this.command('RESET');
                    break;
                case 'help':
                    this.println(`Available Commands`);
                    this.println('reset         reset the game');
                    this.println('online        list online players');
                    this.println('players       list playing players');
                    this.ready = true;
                    this.writePrompt();
                    break;
                case 'clear':
                    this.child.underlying.clear();
                    this.ready = true;
                    this.writePrompt();
                    break;
                case 'online':
                    this.command('ONLINE');
                    break;
                case 'players':
                    this.command('PLAYERS');
                    break;
                default:
                    this.println(
                        `${cmd} : command not found, type help to get help`,
                    );
                    this.ready = true;
                    this.child.underlying.scrollLines(1);
                    this.writePrompt();
            }
        } else {
            this.socket.emit({
                event: WebSocketOutgoingEvent.adminJoin,
                data: command,
            });
        }
    }

    println(line: string) {
        this.child.write(line + '\r\n');
    }

    adminJoin$ = this.socket.listenFor<boolean>(
        WebSocketIncomingEvent.adminLoggedIn,
    );

    commandResult$ = this.socket.listenFor<string>(
        WebSocketIncomingEvent.result,
    );
}
