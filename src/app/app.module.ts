/** Angular Imports */
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ServiceWorkerModule } from '@angular/service-worker';

/** Environment Configuration */
import { environment } from '../environments/environment';

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
import { DatePipe, LocationStrategy } from '@angular/common';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { KeycloakService } from 'keycloak-angular';
import { initializer } from './core/init/keycloak-init.factory';
import { AuthenticationService } from './core/authentication/authentication.service';
import { FormsModule } from '@angular/forms';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { DragulaModule } from 'ng2-dragula';
/** Matomo module */
import { MatomoModule } from 'ngx-matomo';

/**
 * App Module
 *
 * Core module and all feature modules should be imported here in proper order.
 */
@NgModule({
  imports: [
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (http: HttpClient, locationStrategy: LocationStrategy) => {
          return new TranslateHttpLoader(
            http,
            `${window.location.protocol}//${
              window.location.host
            }${locationStrategy.getBaseHref()}/assets/translations/`,
            '.json'
          );
        },
        deps: [HttpClient, LocationStrategy],
      },
    }),
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
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
    DragulaModule.forRoot(),
    MatomoModule.forRoot({
      scriptUrl: `${environment.matomoSiteUrl}/matomo.js}`, // Matomo's site handler frontend URI
      trackers: [
        {
          trackerUrl:  `${environment.matomoSiteUrl}/matomo.php`, // Matomo's site handler backend URI
          siteId: environment.matomoSiteId , // Matomo's site ID (find it in your Matomo's settings)
        }
      ],
      routeTracking: {
        enable: true
      }
    }),
  ],
  declarations: [WebAppComponent, NotFoundComponent],
  providers: [
    DatePipe,
    KeycloakService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializer,
      deps: [KeycloakService, AuthenticationService],
      multi: true,
    },
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
  ],
  bootstrap: [WebAppComponent],
})
export class AppModule {}
