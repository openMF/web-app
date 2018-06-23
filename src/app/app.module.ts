import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ServiceWorkerModule } from '@angular/service-worker';
import { TranslateModule } from '@ngx-translate/core';
import { NgxChartsModule } from '@swimlane/ngx-charts';

import { environment } from '../environments/environment';
import { CoreModule } from '../app/core';
import { SharedModule } from '../app/shared';
import { HomeModule } from './home/home.module';
import { AboutModule } from './about/about.module';
import { ClientsModule} from './clients/clients.module';
import { AccountingModule } from './accounting/accounting.module';
import { LoginModule } from './login/login.module';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { NavigationModule } from './navigation/navigation.module';
import { SelfServiceModule } from './self-service/self-service.module';

@NgModule({
  imports: [
    BrowserModule,
    ServiceWorkerModule.register('./ngsw-worker.js', { enabled: environment.production }),
    FormsModule,
    HttpClientModule,
    TranslateModule.forRoot(),
    NgxChartsModule,
    CoreModule,
    SharedModule,
    HomeModule,
    AboutModule,
    ClientsModule,
    AccountingModule,
    LoginModule,
    NavigationModule,
    SelfServiceModule,
    AppRoutingModule
  ],
  declarations: [AppComponent],
  providers: [
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
