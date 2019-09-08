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
  NzButtonModule
} from 'ng-zorro-antd';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ReactiveFormsModule } from '@angular/forms';
import { GameFieldComponent } from './game-field/game-field.component';
import { ChatComponent } from './chat/chat.component';
import { PlayersComponent } from './players/players.component';
import { ScrollingModule } from '@angular/cdk/scrolling';

@NgModule({
  declarations: [
    HomeComponent,
    GameFieldComponent,
    ChatComponent,
    PlayersComponent
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    ScrollingModule,
    DragDropModule,
    NzSkeletonModule,
    NzLayoutModule,
    NzCardModule,
    NzAvatarModule,
    NzGridModule,
    NzListModule,
    NzButtonModule,
    ReactiveFormsModule
  ]
})
export class HomeModule {}
