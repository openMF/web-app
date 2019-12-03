/** Angular Imports */
import { NgModule } from '@angular/core';

/** Module Imports */
import { SharedModule } from '../shared/shared.module';
import { SystemRoutingModule } from './system-routing.module';

/** Component Imports */
import { CodesComponent } from './codes/codes.component';
import { SystemComponent } from './system.component';
import { CreateCodeComponent } from './codes/create-code/create-code.component';
import { ExternalServicesComponent } from './external-services/external-services.component';
import { ManageDataTablesComponent } from './manage-data-tables/manage-data-tables.component';
import { ManageHooksComponent } from './manage-hooks/manage-hooks.component';
import { RolesAndPermissionsComponent } from './roles-and-permissions/roles-and-permissions.component';
import { AddRoleComponent } from './roles-and-permissions/add-role/add-role.component';
import { ManageSurveysComponent } from './manage-surveys/manage-surveys.component';
import { ManageSchedulerJobsComponent } from './manage-scheduler-jobs/manage-scheduler-jobs.component';
import { GlobalConfigurationsComponent } from './global-configurations/global-configurations.component';
import { EditConfigurationComponent } from './global-configurations/edit-configuration/edit-configuration.component';
import { AmazonS3Component } from './external-services/amazon-s3/amazon-s3.component';
import { EmailComponent } from './external-services/email/email.component';
import { SMSComponent } from './external-services/sms/sms.component';
import { NotificationComponent } from './external-services/notification/notification.component';
import { EditAmazonS3Component } from './external-services/amazon-s3/edit-amazon-s3/edit-amazon-s3.component';
import { EditEmailComponent } from './external-services/email/edit-email/edit-email.component';
import { EditNotificationComponent } from './external-services/notification/edit-notification/edit-notification.component';
import { EditSMSComponent } from './external-services/sms/edit-sms/edit-sms.component';
import { ViewCodeComponent } from './codes/view-code/view-code.component';
import { EditCodeComponent } from './codes/edit-code/edit-code.component';
import { AccountNumberPreferencesComponent } from './account-number-preferences/account-number-preferences.component';
import { CreateAccountNumberPreferenceComponent } from './account-number-preferences/create-account-number-preference/create-account-number-preference.component';
import { ViewAccountNumberPreferenceComponent } from './account-number-preferences/view-account-number-preference/view-account-number-preference.component';
import { EditAccountNumberPreferenceComponent } from './account-number-preferences/edit-account-number-preference/edit-account-number-preference.component';
import { ManageReportsComponent } from './manage-reports/manage-reports.component';
import { ViewReportComponent } from './manage-reports/view-report/view-report.component';
import { CreateReportComponent } from './manage-reports/create-report/create-report.component';
import { EditReportComponent } from './manage-reports/edit-report/edit-report.component';

/** Dialog Component Imports */
import { ReportParameterDialogComponent } from './manage-reports/report-parameter-dialog/report-parameter-dialog.component';

@NgModule({
  imports: [
    SystemRoutingModule,
    SharedModule
  ],
  declarations: [
    SystemComponent,
    CodesComponent,
    ViewCodeComponent,
    CreateCodeComponent,
    EditCodeComponent,
    ExternalServicesComponent,
    ManageDataTablesComponent,
    ManageHooksComponent,
    RolesAndPermissionsComponent,
    ManageSurveysComponent,
    ManageSchedulerJobsComponent,
    GlobalConfigurationsComponent,
    EditConfigurationComponent,
    AmazonS3Component,
    EmailComponent,
    SMSComponent,
    NotificationComponent,
    EditAmazonS3Component,
    EditEmailComponent,
    EditNotificationComponent,
    EditSMSComponent,
    AccountNumberPreferencesComponent,
    CreateAccountNumberPreferenceComponent,
    ViewAccountNumberPreferenceComponent,
    EditAccountNumberPreferenceComponent,
    ManageReportsComponent,
    ViewReportComponent,
    CreateReportComponent,
    EditReportComponent,
    ReportParameterDialogComponent,
    AddRoleComponent
  ],
  entryComponents: [
    ReportParameterDialogComponent
  ]
})
export class SystemModule { }
