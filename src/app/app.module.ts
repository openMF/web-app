/** Angular Imports */
import { APP_INITIALIZER, Injector, NgModule } from '@angular/core';
import { BrowserModule, HammerModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ServiceWorkerModule } from '@angular/service-worker';

/** Environment Configuration */
import { environment } from 'environments/environment';

/** Main Component */
import { WebAppComponent } from './web-app.component';

/** Not Found Component */
import { NotFoundComponent } from './not-found/not-found.component';

/** Custom Modules */
import { CoreModule } from './core/core.module';
import { HomeModule } from './home/home.module';
import { LoginModule } from './login/login.module';
import { SettingsModule } from './settings/settings.module';
import { NavigationModule } from './navigation/navigation.module';
import { ClientsModule } from './clients/clients.module';
import { GroupsModule } from './groups/groups.module';
import { CentersModule } from './centers/centers.module';
import { AccountingModule } from './accounting/accounting.module';
import { SelfServiceModule } from './self-service/self-service.module';
import { SystemModule } from './system/system.module';
import { ProductsModule } from './products/products.module';
import { OrganizationModule } from './organization/organization.module';
import { TemplatesModule } from './templates/templates.module';
import { UsersModule } from './users/users.module';
import { ReportsModule } from './reports/reports.module';
import { SearchModule } from './search/search.module';
import { NotificationsModule } from './notifications/notifications.module';
import { CollectionsModule } from './collections/collections.module';
import { ProfileModule } from './profile/profile.module';
import { TasksModule } from './tasks/tasks.module';

/** Main Routing Module */
import { AppRoutingModule } from './app-routing.module';

import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { HttpLoaderFactory } from './translation-config';
import { DatePipe } from '@angular/common';
import { HttpService } from './core/http/http.service';

import { AppConfig } from './app.config';

/**
 * App Module
 *
 * Core module and all feature modules should be imported here in proper order.
 */
@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HammerModule,
    HttpClientModule,
    ServiceWorkerModule.register('./ngsw-worker.js', { enabled: environment.production }),
    CoreModule,
    HomeModule,
    LoginModule,
    ProfileModule,
    SettingsModule,
    NavigationModule,
    ClientsModule,
    ReportsModule,
    GroupsModule,
    CentersModule,
    AccountingModule,
    SelfServiceModule,
    SystemModule,
    ProductsModule,
    OrganizationModule,
    TemplatesModule,
    UsersModule,
    NotificationsModule,
    SearchModule,
    CollectionsModule,
    TasksModule,
    AppRoutingModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [ HttpClient ]
      }
    }),
  ],
  exports: [TranslateModule],
  declarations: [WebAppComponent, NotFoundComponent],
  providers: [AppConfig,
    DatePipe,
    HttpService,
    {
      provide: APP_INITIALIZER,
      useFactory: initConfig,
      deps: [ AppConfig, TranslateService, Injector ],
      multi: true
    }],
  bootstrap: [WebAppComponent]
})
export class AppModule { }

export function initConfig(config: AppConfig) {
  return () => config.load();
}
