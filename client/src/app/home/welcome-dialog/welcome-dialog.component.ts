import { Component, OnInit, Input } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd';
import { FormControl } from '@angular/forms';
import {
    WebSocketService,
    filterEvent,
} from 'src/app/core/service/web-socket.service';
import {
    WebSocketOutgoingEvent,
    WebSocketIncomingEvent,
} from 'src/app/core/models/web-socket.model';
import { take } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { Player } from 'src/app/core/models/player.model';
import { AuthService } from 'src/app/core/service/auth.service';

@Component({
    selector: 'app-welcome-dialog',
    templateUrl: './welcome-dialog.component.html',
    styleUrls: ['./welcome-dialog.component.scss'],
})
export class WelcomeDialogComponent {
    @Input() edit = false;

    nickname = new FormControl(
        this.auth.player$.value ? this.auth.player$.value.name : null,
    );
    avatar = new FormControl(
        this.auth.player$.value ? this.auth.player$.value.avatar : null,
    );
    remember = new FormControl(this.auth.remember$.value);

    nicknameError$ = new BehaviorSubject<string>(undefined);

    avatars = [
        'https://i.pinimg.com/originals/fa/0c/05/fa0c05778206cb2b2dddf89267b7a31c.jpg',
        'https://media1.tenor.com/images/ff5f832e40cf3ec7787d1c539bf02ce7/tenor.gif?itemid=7939264',
        'https://vignette.wikia.nocookie.net/surrealmemes/images/0/09/Meme_Man_HD.png/revision/latest?cb=20190103112747',
        'https://i.kym-cdn.com/photos/images/newsfeed/000/925/494/218.png_large',
        'https://i.imgur.com/sYDqBU1.jpg',
        'https://pbs.twimg.com/profile_images/951240859298746369/vA2OVYFE_400x400.jpg',
        'https://vignette.wikia.nocookie.net/meme/images/4/42/1385136139955.png/revision/latest?cb=20150207013804',
        'https://i.kym-cdn.com/photos/images/newsfeed/001/535/447/f3f.jpg',
        'https://upload.wikimedia.org/wikipedia/en/f/f9/Dat_Boi_%28resized_50%25%29.jpg',
        'https://i.pinimg.com/originals/87/f5/aa/87f5aaa2fe343cebac0df3b5031f16ed.gif',
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT-u1WHqURBNarCxD-qi9A9ITBOI1xy2wjcMSLowYQYUOpwwipQ',
        'https://ih0.redbubble.net/image.342880217.9061/ap,550x550,16x12,1,transparent,t.u7.png',
        'https://i.kym-cdn.com/photos/images/newsfeed/001/469/824/de5.jpg',
        'https://pbs.twimg.com/media/EDUEcRoUYAA7WNL?format=jpg&name=small',
    ];
    players$ = this.socket.observable.pipe(
        filterEvent<Player[]>(WebSocketIncomingEvent.connected),
    );

    constructor(
        private modal: NzModalRef,
        private socket: WebSocketService,
        private auth: AuthService,
    ) {}

    destroyModal(): void {
        this.modal.destroy({ data: 'this the result data' });
    }

    submitUser() {
        this.nicknameError$.next(undefined);
        if (this.nickname.value) {
            const player: Partial<Player> = {
                name: this.nickname.value,
                avatar: this.avatar.value,
            };
            this.socket.emit({
                event: this.edit
                    ? WebSocketOutgoingEvent.edit
                    : WebSocketOutgoingEvent.join,
                data: player,
            });
            this.socket.observable
                .pipe(
                    filterEvent<Player>(WebSocketIncomingEvent.playerInfo),
                    take(1),
                )
                .subscribe(data => {
                    this.destroyModal();
                    this.auth.setPlayer(data);
                    this.auth.remember$.next(this.remember.value);
                });
        } else {
            this.nicknameError$.next('Please enter nickname');
        }
    }
}
