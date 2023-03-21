/** Angular Imports */
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClient, HttpClientModule } from '@angular/common/http';

/** Environment Configuration */

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
import { ConfigurationWizardModule } from './configuration-wizard/configuration-wizard.module';
import {PortalModule} from '@angular/cdk/portal';

/** Main Routing Module */
import { AppRoutingModule } from './app-routing.module';
import { DatePipe, LocationStrategy } from '@angular/common';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

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
          return new TranslateHttpLoader(http, `${ window.location.protocol }//${ window.location.host }${locationStrategy.getBaseHref()}/assets/translations/`, '.json');
        },
        deps: [HttpClient, LocationStrategy]
      }
    }),
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    PortalModule,
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
    ConfigurationWizardModule,
    AppRoutingModule,
  ],
  declarations: [WebAppComponent, NotFoundComponent],
  providers: [DatePipe],
  bootstrap: [WebAppComponent]
})
export class AppModule { }
