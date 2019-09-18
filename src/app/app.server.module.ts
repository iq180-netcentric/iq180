import { NgModule } from '@angular/core';
import { ServerModule } from '@angular/platform-server';

import { AppModule } from './app.module';
import { AppComponent } from './app.component';
import { ModuleMapLoaderModule } from '@nguniversal/module-map-ngfactory-loader';
import { HttpClientModule } from '@angular/common/http';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NzI18nModule, NZ_I18N, en_US } from 'ng-zorro-antd';

@NgModule({
    imports: [
        AppModule,
        ServerModule,
        ModuleMapLoaderModule,
        HttpClientModule,
        NoopAnimationsModule,
        NzI18nModule,
    ],
    bootstrap: [AppComponent],
    providers: [{ provide: NZ_I18N, useValue: en_US }],
})
export class AppServerModule {}
