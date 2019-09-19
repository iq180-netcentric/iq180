import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';

@Component({
    selector: 'app-menu',
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {
    @Output() ready = new EventEmitter();
    @Output() singlePlayer = new EventEmitter();

    @Input() isReady = false;

    constructor() {}

    ngOnInit() {}

    readyClicked() {
        this.ready.emit(undefined);
    }

    singlePlayerClicked() {
        this.singlePlayer.emit(undefined);
    }
}
