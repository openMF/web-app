import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ServiceWorkerModule } from '@angular/service-worker';

import { TranslateModule } from '@ngx-translate/core';
import { NgxChartsModule } from '@swimlane/ngx-charts';

import { environment } from '../environments/environment';

import { WebAppComponent } from './web-app.component';

import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { NavigationModule } from './navigation/navigation.module';
import { HomeModule } from './home/home.module';
import { AboutModule } from './about/about.module';
import { LoginModule } from './login/login.module';
import { ClientsModule} from './clients/clients.module';
import { AccountingModule } from './accounting/accounting.module';
import { SelfServiceModule } from './self-service/self-service.module';

import { AppRoutingModule } from './app-routing.module';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    ServiceWorkerModule.register('./ngsw-worker.js', { enabled: environment.production }),
    TranslateModule.forRoot(),
    NgxChartsModule,
    CoreModule,
    SharedModule,
    HomeModule,
    NavigationModule,
    AboutModule,
    LoginModule,
    ClientsModule,
    AccountingModule,
    SelfServiceModule,
    AppRoutingModule
  ],
  declarations: [WebAppComponent],
  providers: [
  ],
  bootstrap: [WebAppComponent]
})
export class AppModule { }
