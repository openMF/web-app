import { NgModule } from '@angular/core';

/** Routing Imports */
import { Routes, RouterModule } from '@angular/router';
import { Route } from '../core/route/route.service';
import { extract } from '../core/i18n/i18n.service';

/** Component Imports */
import { SystemComponent } from './system.component';
import { CodesComponent } from './codes/codes.component';
import { CreateCodeComponent } from './codes/create-code/create-code.component';
import { ViewCodeComponent } from './codes/view-code/view-code.component';
import { EditCodeComponent } from './codes/edit-code/edit-code.component';
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
import { AccountNumberPreferencesComponent } from './account-number-preferences/account-number-preferences.component';
import { CreateAccountNumberPreferenceComponent } from './account-number-preferences/create-account-number-preference/create-account-number-preference.component';
import { ViewAccountNumberPreferenceComponent } from './account-number-preferences/view-account-number-preference/view-account-number-preference.component';
import { EditAccountNumberPreferenceComponent } from './account-number-preferences/edit-account-number-preference/edit-account-number-preference.component';
import { ManageReportsComponent } from './manage-reports/manage-reports.component';
import { EditReportComponent } from './manage-reports/edit-report/edit-report.component';
import { CreateReportComponent } from './manage-reports/create-report/create-report.component';
import { ViewReportComponent } from './manage-reports/view-report/view-report.component';

/** Custom Resolvers */
import { CodesResolver } from './codes/codes.resolver';
import { CodeResolver } from './codes/code.resolver';
import { CodeValuesResolver } from './codes/view-code/code-values.resolver';
import { ManageDataTablesResolver } from './manage-data-tables/manage-data-tables.resolver';
import { ManageHooksResolver } from './manage-hooks/manage-hooks.resolver';
import { RolesAndPermissionsResolver } from './roles-and-permissions/roles-and-permissions.resolver';
import { ManageSurveysResolver } from './manage-surveys/manage-surveys.resolver';
import { ManageSchedulerJobsResolver } from './manage-scheduler-jobs/manage-scheduler-jobs.resolver';
import { GlobalConfigurationsResolver } from './global-configurations/global-configurations.resolver';
import { GlobalConfigurationResolver } from './global-configurations/global-configuration.resolver';
import { AmazonS3ConfigurationResolver } from './external-services/amazon-s3/amazon-s3.resolver';
import { EmailConfigurationResolver } from './external-services/email/email.resolver';
import { SMSConfigurationResolver } from './external-services/sms/sms.resolver';
import { NotificationConfigurationResolver } from './external-services/notification/notification.resolver';
import { AccountNumberPreferencesResolver } from './account-number-preferences/account-number-preferences.resolver';
import { AccountNumberPreferencesTemplateResolver } from './account-number-preferences/create-account-number-preference/account-number-preferences-template.resolver';
import { AccountNumberPreferenceResolver } from './account-number-preferences/view-account-number-preference/account-number-preference.resolver';
import { ReportsResolver } from './manage-reports/reports.resolver';
import { ReportResolver } from './manage-reports/report.resolver';
import { ReportTemplateResolver } from './manage-reports/report-template.resolver';

const routes: Routes = [
  Route.withShell([
    {
      path: 'system',
      data: { title: extract('System'), breadcrumb: 'System' },
      children: [
      {
        path: '',
        component: SystemComponent
      },
      {
        path: 'codes',
        data: { title: extract('View Codes'), breadcrumb: 'Codes' },
        children: [
          {
            path: '',
            component: CodesComponent,
            resolve: {
              codes: CodesResolver
            }
          },
          {
            path: 'create',
            component: CreateCodeComponent,
            data: { title: extract('Create Code'), breadcrumb: 'Create' }
            },
            {
              path: ':id',
              data: { title: extract('View Code'), routeParamBreadcrumb: 'id' },
              children: [
                {
                  path: '',
                  component: ViewCodeComponent,
                  resolve: {
                    code: CodeResolver,
                    codeValues: CodeValuesResolver
                  }
                },
                {
                  path: 'edit',
                  component: EditCodeComponent,
                  data: { title: extract('Edit Code'), breadcrumb: 'Edit', routeParamBreadcrumb: false },
                  resolve: {
                    code: CodeResolver
                  }
                }
              ]
          }
        ],

      },
      {
          path: 'external-services',
          data: { title: extract('External Services'), breadcrumb: 'External Services' },
          children: [
            {
              path: '',
              component: ExternalServicesComponent
            },
            {
              path: 'amazon-s3',
              data: { title: extract('View Amazon S3 Configuration'), breadcrumb: 'Amazon S3' },
              children: [
                {
                  path: '',
                  component: AmazonS3Component,
                  resolve: {
                    amazonS3Configuration: AmazonS3ConfigurationResolver
                  }
                },
                {
                  path: 'edit',
                  component: EditAmazonS3Component,
                  data: {title: extract('Edit Amazon S3 Configuration'), breadcrumb: 'Edit'},
                  resolve: {
                    amazonS3Configuration: AmazonS3ConfigurationResolver
                  }
                }
              ]
            },
            {
              path: 'email',
              data: { title: extract('View Email Configuration'), breadcrumb: 'Email' },
              children: [
                {
                  path: '',
                  component: EmailComponent,
                  resolve: {
                    emailConfiguration: EmailConfigurationResolver
                  }
                },
                {
                  path: 'edit',
                  component: EditEmailComponent,
                  data: { title: extract('Edit Email Configuration'), breadcrumb: 'Edit' },
                  resolve: {
                    emailConfiguration: EmailConfigurationResolver
                  }
                }
              ]
            },
            {
              path: 'sms',
              data: { title: extract('View SMS Configuration'), breadcrumb: 'SMS' },
              children: [
                {
                  path: '',
                  component: SMSComponent,
                  resolve: {
                    smsConfiguration: SMSConfigurationResolver
                  }
                },
                {
                  path: 'edit',
                  data: { title: extract('Edit SMS Configuration'), breadcrumb: 'Edit' },
                  component: EditSMSComponent,
                  resolve: {
                    smsConfiguration: SMSConfigurationResolver
                  }
                }
              ]
            },
            {
              path: 'notification',
              data: { title: extract('View Notification Configuration'), breadcrumb: 'Notification' },
              children: [
                {
                  path: '',
                  component: NotificationComponent,
                  resolve: {
                    notificationConfiguration: NotificationConfigurationResolver
                  }
                },
                {
                  path: 'edit',
                  component: EditNotificationComponent,
                  data: { title: extract('Edit Notification Configuration'), breadcrumb: 'Edit' },
                  resolve: {
                    notificationConfiguration: NotificationConfigurationResolver
                  }
                }
              ]
            }
          ]
        },
        {
          path: 'data-tables',
          component: ManageDataTablesComponent,
          resolve: {
                dataTables: ManageDataTablesResolver
          },
          data: { title:  extract('Manage Data Tables'), breadcrumb: 'Manage Data Tables' },
      },
      {
          path: 'hooks',
          component: ManageHooksComponent,
          resolve: {
                hooks: ManageHooksResolver
          },
          data: { title:  extract('Manage Hooks'), breadcrumb: 'Manage Hooks' },
      },
      {
          path: 'roles-and-permissions',
          data: { title:  extract('Roles and Permissions'), breadcrumb: 'Roles and Permissions' },
          children: [
            {
              path: '',
              component: RolesAndPermissionsComponent,
              resolve: {
                roles: RolesAndPermissionsResolver
              }
            },
            {
              path: 'add',
              component: AddRoleComponent,
              data: { title: extract('Add Role'), breadcrumb: 'Add' }
            }
          ]
      },
      {
        path: 'surveys',
        component: ManageSurveysComponent,
        resolve: {
              surveys: ManageSurveysResolver
        },
        data: { title:  extract('Manage Surveys'), breadcrumb: 'Manage Surveys' },
      },
      {
        path: 'scheduler-jobs',
        component: ManageSchedulerJobsComponent,
        resolve: {
              jobsScheduler: ManageSchedulerJobsResolver
        },
        data: { title:  extract('Manage Scheduler Jobs'), breadcrumb: 'Manage Scheduler Jobs' },
      },
      {
        path: 'global-configurations',
        data: { title: extract('Global Configurations'), breadcrumb: 'Global Configurations' },
        children: [
          {
            path: '',
            component: GlobalConfigurationsComponent,
            resolve: {
              configurations: GlobalConfigurationsResolver
            }
          },
          {
            path: ':id/edit',
            component: EditConfigurationComponent,
            data: { title: extract('Edit Configuration'), breadcrumb: 'Edit' },
            resolve: {
              configuration: GlobalConfigurationResolver
            }
          }
        ],
        },
        {
          path: 'account-number-preferences',
          data: { title: extract('Account Number Preferences'), breadcrumb: 'Account Number Preferences' },
          children: [
            {
              path: '',
              component: AccountNumberPreferencesComponent,
              resolve: {
                accountNumberPreferences: AccountNumberPreferencesResolver
              }
            },
            {
              path: 'create',
              component: CreateAccountNumberPreferenceComponent,
              data: { title: extract('Create Account Number Preference'), breadcrumb: 'Create' },
              resolve: {
                accountNumberPreferencesTemplate: AccountNumberPreferencesTemplateResolver
              }
            },
            {
              path: ':id',
              data: { title: extract('View Account Number Preference'), routeParamBreadcrumb: 'id' },
              children: [
                {
                  path: '',
                  component: ViewAccountNumberPreferenceComponent,
                  resolve: {
                    accountNumberPreference: AccountNumberPreferenceResolver
                  }
                },
                {
                  path: 'edit',
                  component: EditAccountNumberPreferenceComponent,
                  data: { title: extract('Edit Account Number Preference'), breadcrumb: 'Edit', routeParamBreadcrumb: false },
                  resolve: {
                    accountNumberPreference: AccountNumberPreferenceResolver,
                    accountNumberPreferencesTemplate: AccountNumberPreferencesTemplateResolver
                  }
                }
              ]
            }
          ]
        },
        {
          path: 'reports',
          data: { title: extract('Manage Reports'), breadcrumb: 'Manage Reports' },
          children: [
            {
              path: '',
              component: ManageReportsComponent,
              resolve: {
                reports: ReportsResolver
              }
            },
            {
              path: 'create',
              component: CreateReportComponent,
              data: { title: extract('Create Report'), breadcrumb: 'Create' },
              resolve: {
                reportTemplate: ReportTemplateResolver
              }
            },
            {
              path: ':id',
              data: { title: extract('View Report'), routeParamBreadcrumb: 'id' },
              children: [
                {
                  path: '',
                  component: ViewReportComponent,
                  resolve: {
                    report: ReportResolver
                  }
                },
                {
                  path: 'edit',
                  component: EditReportComponent,
                  data: { title: extract('Edit Report'), routeParamBreadcrumb: false, breadcrumb: 'Edit' },
                  resolve: {
                    report: ReportResolver,
                    reportTemplate: ReportTemplateResolver
                  }
                }
              ]
            }
          ]
        }
      ]
    }
  ])
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [
    CodesResolver,
    CodeResolver,
    CodeValuesResolver,
    ManageDataTablesResolver,
    ManageHooksResolver,
    RolesAndPermissionsResolver,
    ManageSurveysResolver,
    ManageSchedulerJobsResolver,
    GlobalConfigurationsResolver,
    GlobalConfigurationResolver,
    AmazonS3ConfigurationResolver,
    EmailConfigurationResolver,
    SMSConfigurationResolver,
    NotificationConfigurationResolver,
    AccountNumberPreferencesResolver,
    AccountNumberPreferencesTemplateResolver,
    AccountNumberPreferenceResolver,
    ReportsResolver,
    ReportResolver,
    ReportTemplateResolver
  ]
})
export class SystemRoutingModule { }
