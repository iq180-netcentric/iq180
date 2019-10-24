import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd';
import { FormControl, Validators } from '@angular/forms';
import { WebSocketService } from 'src/app/core/service/web-socket.service';
import {
    WebSocketOutgoingEvent,
    WebSocketIncomingEvent,
} from 'src/app/core/models/web-socket.model';
import { take, takeUntil, pluck, filter } from 'rxjs/operators';
import { BehaviorSubject, fromEvent, Subject } from 'rxjs';
import { Player } from 'src/app/core/models/player.model';
import { AuthService } from 'src/app/core/service/auth.service';
import { FormBuilder, FormGroup } from 'ngx-strongly-typed-forms';
import { createHash } from 'crypto';

@Component({
    selector: 'app-admin-login',
    templateUrl: './admin-login.component.html',
    styleUrls: ['./admin-login.component.scss'],
})
export class AdminLoginComponent implements OnInit, OnDestroy {
    @Input() edit = false;
    @Input() player: Player = undefined;
    @Input() remember = false;

    form: FormGroup<LoginInput>;

    usernameInput: FormControl;
    passwordInput: FormControl;

    // nicknameInput: FormControl;
    // avatarInput: FormControl;
    // rememberInput: FormControl;

    constructor(
        private modal: NzModalRef,
        private socket: WebSocketService,
        private auth: AuthService,
        private fb: FormBuilder,
    ) {}

    ngOnInit() {
        this.form = this.fb.group<LoginInput>({
            username: [
                this.usernameInput.value,
                [Validators.required],
            ],
            password: [
                this.passwordInput.value,
                [Validators.required],
            ],
        });
    }

    ngOnDestroy() {

    }

    destroyModal(): void {
        this.modal.destroy({ data: 'this the result data' });
    }

    submitUser() {
        if (this.form.valid) {
            const { username, password } = this.form.value;
            const matchpassword = '10a53bf995da6da7de485b3b4a6894da19075713fcccdb86dc7c29ce1d81e2eb';
            if (username === 'admin' &&
                createHash('sha256').update(createHash('sha256').update(password).digest('hex')).digest('hex') === matchpassword) {
                    this.modal.close();
            }
        }
    }
}

interface LoginInput {
    username: string;
    password: string;
}
