import { NgModule } from '@angular/core';
import { NgTerminalModule } from 'ng-terminal';
import { AdminComponent } from './admin.component';
import { AdminRoutingModule } from './admin-routing.module';
import { CommonModule } from '@angular/common';

@NgModule({
    declarations: [AdminComponent],
    imports: [CommonModule, NgTerminalModule, AdminRoutingModule],
})
export class AdminModule {}
