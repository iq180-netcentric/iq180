import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
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
    NzCheckboxModule,
} from 'ng-zorro-antd';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ReactiveFormsModule } from '@angular/forms';
import { ChatComponent } from './chat/chat.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { AdminLoginComponent } from './admin-login/admin-login.component';
import { NgxStronglyTypedFormsModule } from 'ngx-strongly-typed-forms';

@NgModule({
    declarations: [
        AdminComponent,
        ChatComponent,
        AdminLoginComponent,
    ],
    imports: [
        CommonModule,
        AdminRoutingModule,
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
        NzCheckboxModule,
        NzListModule,
        NzRadioModule,
        NzButtonModule,
        ReactiveFormsModule,
        NgxStronglyTypedFormsModule,
    ],
    entryComponents: [AdminLoginComponent],
})
export class AdminModule {}
