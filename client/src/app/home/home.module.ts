import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import {
    NzLayoutModule,
    NzGridModule,
    NzListModule,
    NzSkeletonModule,
    NzCardModule,
    NzAvatarModule,
    NzButtonModule,
    NzModalModule,
    NzInputModule,
    NzAlertModule,
    NzRadioModule,
} from 'ng-zorro-antd';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ReactiveFormsModule } from '@angular/forms';
import { GameFieldComponent } from './game-field/game-field.component';
import { ChatComponent } from './chat/chat.component';
import { PlayersComponent } from './players/players.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { WelcomeDialogComponent } from './welcome-dialog/welcome-dialog.component';

@NgModule({
    declarations: [
        HomeComponent,
        GameFieldComponent,
        ChatComponent,
        PlayersComponent,
        WelcomeDialogComponent,
    ],
    imports: [
        CommonModule,
        HomeRoutingModule,
        ScrollingModule,
        ReactiveFormsModule,
        DragDropModule,
        NzSkeletonModule,
        NzLayoutModule,
        NzCardModule,
        NzModalModule,
        NzAlertModule,
        NzAvatarModule,
        NzInputModule,
        NzGridModule,
        NzListModule,
        NzRadioModule,
        NzButtonModule,
        ReactiveFormsModule,
    ],
    entryComponents: [WelcomeDialogComponent],
})
export class HomeModule {}
