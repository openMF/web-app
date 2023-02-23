/** Angular Imports */
import { NgModule } from '@angular/core';

/** Module Imports */
import { SharedModule } from '../shared/shared.module';
import { SystemRoutingModule } from './system-routing.module';
import { PipesModule } from '../pipes/pipes.module';
import { DirectivesModule } from '../directives/directives.module';

/** Component Imports */
import { CodesComponent } from './codes/codes.component';
import { SystemComponent } from './system.component';
import { CreateCodeComponent } from './codes/create-code/create-code.component';
import { ExternalServicesComponent } from './external-services/external-services.component';
import { ManageDataTablesComponent } from './manage-data-tables/manage-data-tables.component';
import { CreateDataTableComponent } from './manage-data-tables/create-data-table/create-data-table.component';
import { ViewDataTableComponent } from './manage-data-tables/view-data-table/view-data-table.component';
import { EditDataTableComponent } from './manage-data-tables/edit-data-table/edit-data-table.component';
import { ManageHooksComponent } from './manage-hooks/manage-hooks.component';
import { RolesAndPermissionsComponent } from './roles-and-permissions/roles-and-permissions.component';
import { AddRoleComponent } from './roles-and-permissions/add-role/add-role.component';
import { ManageSurveysComponent } from './manage-surveys/manage-surveys.component';
import { ViewSurveyComponent } from './manage-surveys/view-survey/view-survey.component';
import { CreateSurveyComponent } from './manage-surveys/create-survey/create-survey.component';
import { EditConfigurationComponent } from './configurations/global-configurations-tab/edit-configuration/edit-configuration.component';
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
import { AuditTrailsComponent } from './audit-trails/audit-trails.component';
import { ViewAuditComponent } from './audit-trails/view-audit/view-audit.component';
import { ColumnDialogComponent } from './manage-data-tables/column-dialog/column-dialog.component';
import { ViewHistorySchedulerJobComponent } from './manage-jobs/scheduler-jobs/view-history-scheduler-job/view-history-scheduler-job.component';
import { EditHookComponent } from './manage-hooks/edit-hook/edit-hook.component';
import { ViewHookComponent } from './manage-hooks/view-hook/view-hook.component';
import { CreateHookComponent } from './manage-hooks/create-hook/create-hook.component';
import { ViewRoleComponent } from './roles-and-permissions/view-role/view-role.component';
import { EditRoleComponent } from './roles-and-permissions/edit-role/edit-role.component';
import { EntityToEntityMappingComponent } from './entity-to-entity-mapping/entity-to-entity-mapping.component';

/** Dialog Component Imports */
import { ReportParameterDialogComponent } from './manage-reports/report-parameter-dialog/report-parameter-dialog.component';
import { AddEventDialogComponent } from './manage-hooks/add-event-dialog/add-event-dialog.component';
import { ViewSchedulerJobComponent } from './manage-jobs/scheduler-jobs/view-scheduler-job/view-scheduler-job.component';
import { EditSchedulerJobComponent } from './manage-jobs/scheduler-jobs/edit-scheduler-job/edit-scheduler-job.component';
import { ConfigureMakerCheckerTasksComponent } from './configure-maker-checker-tasks/configure-maker-checker-tasks.component';
import { EditSurveyComponent } from './manage-surveys/edit-survey/edit-survey.component';
import { BusinessDateTabComponent } from './configurations/business-date-tab/business-date-tab.component';
import { ConfigurationsComponent } from './configurations/configurations.component';
import { GlobalConfigurationsTabComponent } from './configurations/global-configurations-tab/global-configurations-tab.component';
import { ManageJobsComponent } from './manage-jobs/manage-jobs.component';
import { ManageSchedulerJobsComponent } from './manage-jobs/scheduler-jobs/manage-scheduler-jobs.component';
import { WorkflowDiagramComponent } from './manage-jobs/workflow-jobs/workflow-diagram/workflow-diagram.component';
import { NgxGraphModule } from '@swimlane/ngx-graph';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { WorkflowJobsComponent } from './manage-jobs/workflow-jobs/workflow-jobs.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ManageExternalEventsComponent } from './manage-external-events/manage-external-events.component';
import { CobWorkflowComponent } from './manage-jobs/cob-workflow/cob-workflow.component';

@NgModule({
  imports: [
    SystemRoutingModule,
    SharedModule,
    PipesModule,
    NgxGraphModule,
    BrowserAnimationsModule,
    DragDropModule,
    DirectivesModule
  ],
  declarations: [
    SystemComponent,
    CodesComponent,
    ViewCodeComponent,
    CreateCodeComponent,
    EditCodeComponent,
    ExternalServicesComponent,
    ManageDataTablesComponent,
    CreateDataTableComponent,
    ViewDataTableComponent,
    EditDataTableComponent,
    ManageHooksComponent,
    RolesAndPermissionsComponent,
    ManageSurveysComponent,
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
    AddRoleComponent,
    EditHookComponent,
    ViewHookComponent,
    CreateHookComponent,
    AddEventDialogComponent,
    ColumnDialogComponent,
    AuditTrailsComponent,
    ViewAuditComponent,
    ViewSchedulerJobComponent,
    EditSchedulerJobComponent,
    ViewRoleComponent,
    EditRoleComponent,
    EntityToEntityMappingComponent,
    ConfigureMakerCheckerTasksComponent,
    CreateSurveyComponent,
    EditSchedulerJobComponent,
    ViewHistorySchedulerJobComponent,
    ViewSurveyComponent,
    EditSurveyComponent,
    BusinessDateTabComponent,
    ConfigurationsComponent,
    GlobalConfigurationsTabComponent,
    ManageJobsComponent,
    ManageSchedulerJobsComponent,
    WorkflowJobsComponent,
    WorkflowDiagramComponent,
    ManageExternalEventsComponent,
    CobWorkflowComponent
  ],
})
export class SystemModule { }
