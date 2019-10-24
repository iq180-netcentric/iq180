import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';

@Component({
    selector: 'app-menu',
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {
    @Output() ready = new EventEmitter();
    @Output() singlePlayer = new EventEmitter();
    @Output() multiPlayer = new EventEmitter();

    @Input() isReady = false;
    @Input() isGameReady = false;

    constructor() {}

    ngOnInit() {}

    readyClicked() {
        this.ready.emit(undefined);
    }

    singlePlayerClicked() {
        this.singlePlayer.emit(undefined);
    }

    multiplayerClicked() {
        this.multiPlayer.emit(undefined);
    }
}
