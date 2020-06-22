/** Angular Imports */
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/** Routing Imports */
import { Route } from '../core/route/route.service';

/** Translation Imports */
import { extract } from '../core/i18n/i18n.service';

/** Custom Components */
import { OrganizationComponent } from './organization.component';
import { LoanProvisioningCriteriaComponent } from './loan-provisioning-criteria/loan-provisioning-criteria.component';
import { OfficesComponent } from './offices/offices.component';
import { EmployeesComponent } from './employees/employees.component';
import { CreateEmployeeComponent } from './employees/create-employee/create-employee.component';
import { ViewEmployeeComponent } from './employees/view-employee/view-employee.component';
import { CurrenciesComponent } from './currencies/currencies.component';
import { SmsCampaignsComponent } from './sms-campaigns/sms-campaigns.component';
import { AdhocQueryComponent } from './adhoc-query/adhoc-query.component';
import { ViewAdhocQueryComponent } from './adhoc-query/view-adhoc-query/view-adhoc-query.component';
import { TellersComponent } from './tellers/tellers.component';
import { ViewTellerComponent } from './tellers/view-teller/view-teller.component';
import { PaymentTypesComponent } from './payment-types/payment-types.component';
import { EditPaymentTypeComponent } from './payment-types/edit-payment-type/edit-payment-type.component';
import { PasswordPreferencesComponent } from './password-preferences/password-preferences.component';
import { EntityDataTableChecksComponent } from './entity-data-table-checks/entity-data-table-checks.component';
import { WorkingDaysComponent } from './working-days/working-days.component';
import { CreateOfficeComponent } from './offices/create-office/create-office.component';
import { CreatePaymentTypeComponent } from './payment-types/create-payment-type/create-payment-type.component';
import { CreateAdhocQueryComponent } from './adhoc-query/create-adhoc-query/create-adhoc-query.component';
import { HolidaysComponent } from './holidays/holidays.component';
import { EditEmployeeComponent } from './employees/edit-employee/edit-employee.component';
import { CreateTellerComponent } from './tellers/create-teller/create-teller.component';
import { EditTellerComponent } from './tellers/edit-teller/edit-teller.component';
import { ViewCashierComponent } from './tellers/view-cashier/view-cashier.component';
import { ViewHolidaysComponent } from './holidays/view-holidays/view-holidays.component';
import { ViewOfficeComponent } from './offices/view-office/view-office.component';
import { GeneralTabComponent } from './offices/view-office/general-tab/general-tab.component';
import { DatatableTabsComponent } from './offices/view-office/datatable-tabs/datatable-tabs.component';
import { ViewCampaignComponent } from './sms-campaigns/view-campaign/view-campaign.component';
import { ManageFundsComponent } from './manage-funds/manage-funds.component';
import { ManageCurrenciesComponent } from './currencies/manage-currencies/manage-currencies.component';
import { CashiersComponent } from './tellers/cashiers/cashiers.component';

/** Custom Resolvers */
import { LoanProvisioningCriteriaResolver } from './loan-provisioning-criteria/loan-provisioning-criteria.resolver';
import { OfficesResolver } from './offices/common-resolvers/offices.resolver';
import { EmployeesResolver } from './employees/employees.resolver';
import { EmployeeResolver } from './employees/employee.resolver';
import { EditEmployeeResolver } from './employees/edit-employee.resolver';
import { CurrenciesResolver } from './currencies/currencies.resolver';
import { SmsCampaignsResolver } from './sms-campaigns/common-resolvers/sms-campaigns.resolver';
import { AdhocQueriesResolver } from './adhoc-query/adhoc-queries.resolver';
import { AdhocQueryResolver } from './adhoc-query/adhoc-query.resolver';
import { TellersResolver } from './tellers/common-resolvers/tellers.resolver';
import { TellerResolver } from './tellers/common-resolvers/teller.resolver';
import { PaymentTypesResolver } from './payment-types/payment-types.resolver';
import { PaymentTypeResolver } from './payment-types/payment-type.resolver';
import { PasswordPreferencesTemplateResolver } from './password-preferences/password-preferences-template.resolver';
import { EntityDataTableChecksResolver } from './entity-data-table-checks/entity-data-table-checks.resolver';
import { WorkingDaysResolver } from './working-days/working-days.resolver';
import { EditOfficeResolver } from './offices/common-resolvers/edit-office.resolver';
import { EditOfficeComponent } from './offices/edit-office/edit-office.component';
import { AdhocQueryTemplateResolver } from './adhoc-query/adhoc-query-template.resolver';
import { ViewLoanProvisioningCriteriaComponent } from './loan-provisioning-criteria/view-loan-provisioning-criteria/view-loan-provisioning-criteria.component';
import { LoanProvisioningCriteriasResolver } from './loan-provisioning-criteria/loan-provisioning-criterias.resolver';
import { CashierResolver } from './tellers/common-resolvers/cashier.resolver';
import { CashiersResolver } from './tellers/common-resolvers/cashiers.resolver';
import { HolidayResolver } from './holidays/holiday.resolver';
import { OfficeResolver } from './offices/common-resolvers/office.resolver';
import { OfficeDatatableResolver } from './offices/common-resolvers/office-datatable.resolver';
import { OfficeDatatablesResolver } from './offices/common-resolvers/office-datatables.resolver';
import { SmsCampaignResolver } from './sms-campaigns/common-resolvers/sms-campaign.resolver';
import { ManageFundsResolver } from './manage-funds/manage-funds.resolver';

/** Organization Routes */
const routes: Routes = [
  Route.withShell([
    {
      path: 'organization',
      data: { title: extract('Organization'), breadcrumb: 'Organization' },
      children: [
        {
          path: '',
          component: OrganizationComponent
        },
        {
          path: 'provisioning-criteria',
          data: { title: extract('Provisioning Criteria'), breadcrumb: 'Provisioning Criteria' },
          children: [
            {
              path: '',
              component: LoanProvisioningCriteriaComponent,
              resolve: {
                loanProvisioningCriterias: LoanProvisioningCriteriasResolver
              }
            },

            {
              path: ':id',
              data: { title: extract('View Provisioning Criteria'), routeParamBreadcrumb: 'id' },
              children: [
                {
                  path: '',
                  component: ViewLoanProvisioningCriteriaComponent,
                  resolve: {
                    loanProvisioningCriteria: LoanProvisioningCriteriaResolver
                  }
                },
              ]
            }
          ],
        },
        {
          path: 'offices',
          data: { title: extract('Manage Offices'), breadcrumb: 'Manage Offices' },
          children: [
            {
              path: '',
              component: OfficesComponent,
              resolve: {
              offices: OfficesResolver
              }
            },
            {
              path: 'create',
              component: CreateOfficeComponent,
              data: { title: extract('Create Office'), breadcrumb: 'Create Office' },
              resolve: {
                offices: OfficesResolver,
              }
            },
            {
              path: ':id',
              data: { title: extract('View Office'), routeResolveBreadcrumb: ['office', 'name'] },
              component: ViewOfficeComponent,
              resolve: {
                 officeDatatables: OfficeDatatablesResolver,
                 office: OfficeResolver
              },
              children: [
                {
                  path: 'general',
                  component: GeneralTabComponent,
                  data: { title: extract('General') },
                },
                {
                  path: 'datatables',
                  children: [
                    {
                      path: ':datatableName',
                      component: DatatableTabsComponent,
                      data: { title: extract('View Data Table') },
                      resolve: {
                        officeDatatable: OfficeDatatableResolver
                      }
                    }
                  ]
                }
              ]
            },
            {
              path: ':id',
              data: { title: extract('View Office'), routeParamBreadcrumb: 'id' },
              children: [
                {
                  path: 'edit',
                  component: EditOfficeComponent,
                  data: { title: extract('Edit Office'), breadcrumb: 'Edit', routeParamBreadcrumb: false },
                  resolve: {
                    officeTemplate: EditOfficeResolver
                  }
                }
              ]
            }

          ]
        },
        {
          path: 'employees',
          data: { title: extract('Manage Employees'), breadcrumb: 'Manage Employees' },
          children: [
            {
              path: '',
              component: EmployeesComponent,
              resolve: {
                employees: EmployeesResolver
              }
            },
            {
              path: 'create',
              component: CreateEmployeeComponent,
              data: { title: extract('Create Employee'), breadcrumb: 'Create Employee' },
              resolve: {
                offices: OfficesResolver
              }
            },
            {
              path: ':id',
              data: { title: extract('View Employee'), routeParamBreadcrumb: 'id' },
              children: [
                {
                  path: '',
                  component: ViewEmployeeComponent,
                  resolve: {
                    employee: EmployeeResolver,
                  }
                },
                {
                  path: 'edit',
                  component: EditEmployeeComponent,
                  data: { title: extract('Edit Employee'), breadcrumb: 'Edit', routeParamBreadcrumb: false },
                  resolve: {
                    employee: EditEmployeeResolver
                  }
                }
              ]
            }
          ]
        },
        {
          path: 'currencies',
          data: { title: extract('Currency Configuration'), breadcrumb: 'Currency Configuration' },
          resolve: {
            currencies: CurrenciesResolver
          },
          children: [
            {
              path: '',
              component: CurrenciesComponent,
            },
            {
              path: 'manage',
              data: { title: extract('Manage Currencies'), breadcrumb: 'Manage Currencies' },
              component: ManageCurrenciesComponent
            }
          ]
        },
        {
          path: 'sms-campaigns',
          data: { title: extract('SMS Campaigns'), breadcrumb: 'SMS Campaigns' },
          children: [
            {
              path: '',
              component: SmsCampaignsComponent,
              resolve: {
                smsCampaigns: SmsCampaignsResolver
              }
            },
            {
              path: ':id',
              component: ViewCampaignComponent,
              data: { title: extract('View SMS Campaign'), routeResolveBreadcrumb: ['smsCampaign', 'campaignName'] },
              resolve: {
                smsCampaign: SmsCampaignResolver
              }
            }
          ]
        },
        {
          path: 'adhoc-query',
          data: { title: extract('Adhoc Query'), breadcrumb: 'Adhoc Query' },
          children: [
            {
              path: '',
              component: AdhocQueryComponent,
              resolve: {
                adhocQueries: AdhocQueriesResolver
              }
            },
            {
              path: 'create',
              component: CreateAdhocQueryComponent,
              data: { title: extract('Create Adhoc Query'), breadcrumb: 'Create' },
              resolve: {
                adhocQueryTemplate: AdhocQueryTemplateResolver
              }
            },
            {
              path: ':id',
              component: ViewAdhocQueryComponent,
              data: { title: extract('View Adhoc Query'), routeResolveBreadcrumb: ['adhocQuery', 'name']},
              resolve: {
                adhocQuery: AdhocQueryResolver
              }
            }
          ]
        },
        {
          path: 'tellers',
          data: { title: extract('Tellers'), breadcrumb: 'Tellers' },
          children: [
            {
              path: '',
              component: TellersComponent,
              resolve: {
                tellers: TellersResolver
              }
            },
            {
              path: 'create',
              component: CreateTellerComponent,
              data: { title: extract('Create Teller'), breadcrumb: 'Create' },
              resolve: {
                offices: OfficesResolver
              }
            },
            {
              path: ':id',
              data: { title: extract('View Teller'), routeParamBreadcrumb: 'id' },
              children: [
                {
                  path: '',
                  component: ViewTellerComponent,
                  resolve: {
                    teller: TellerResolver
                  },
                },
                {
                  path: 'edit',
                  component: EditTellerComponent,
                  data: { title: extract('Edit Teller'), breadcrumb: 'Edit', routeParamBreadcrumb: false },
                  resolve: {
                    teller: TellerResolver,
                    offices: OfficesResolver
                  }
                },
                {
                  path: 'cashiers',
                  data: { title: extract('View Cashiers'), breadcrumb: 'View Cashiers', routeParamBreadcrumb: false },
                  children: [
                    {
                      path: '',
                      component: CashiersComponent,
                      resolve: {
                        cashiersData: CashiersResolver
                      }
                    },
                    {
                      path: ':id',
                      component: ViewCashierComponent,
                      data: { title: extract('View Cashier'), breadcrumb: 'View Cashier', routeParamBreadcrumb: 'id' },
                      resolve: {
                        cashier: CashierResolver
                      }
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          path: 'payment-types',
          data: { title: extract('Payment Types'), breadcrumb: 'Payment Types' },
          children: [
            {
              path: '',
              component: PaymentTypesComponent,
              resolve: {
                paymentTypes: PaymentTypesResolver
              }
            },
            {
              path: 'create',
              component: CreatePaymentTypeComponent,
              data: { title: extract('Create Payment Type'), breadcrumb: 'Create Payment Type'}
            },
            {
              path: ':id',
              data: { routeParamBreadcrumb: 'id', addBreadcrumbLink: false },
              children: [
                {
                  path: 'edit',
                  component: EditPaymentTypeComponent,
                  data: { title: extract('Edit Payment Type'), breadcrumb: 'Edit', routeParamBreadcrumb: false },
                  resolve: {
                    paymentType: PaymentTypeResolver
                  }
                }
              ]
            }
          ]
        },
        {
          path: 'password-preferences',
          component: PasswordPreferencesComponent,
          data: { title: extract('Password Preferences'), breadcrumb: 'Password Preferences' },
          resolve: {
            passwordPreferencesTemplate: PasswordPreferencesTemplateResolver
          }
        },
        {
          path: 'entity-data-table-checks',
          component: EntityDataTableChecksComponent,
          data: { title: extract('Entity Data Table Checks'), breadcrumb: 'Entity Data Table Checks' },
          resolve: {
            entityDataTableChecks: EntityDataTableChecksResolver
          }
        },
        {
          path: 'working-days',
          component: WorkingDaysComponent,
          data: { title: extract('Working Days'), breadcrumb: 'Working Days' },
          resolve: {
            workingDays: WorkingDaysResolver
          }
        },
        {
          path: 'manage-funds',
          component: ManageFundsComponent,
          data: { title: extract('Manage Funds Days'), breadcrumb: 'Manage Funds' },
          resolve: {
            funds: ManageFundsResolver
          }
        },
        {
          path: 'bulk-import',
          loadChildren: '../bulk-import/bulk-import.module#BulkImportModule'
        },
        {
          path: 'holidays',
          data: { title: extract('Manage Holidays'), breadcrumb: 'Manage Holidays' },
          children: [
            {
              path: '',
              component: HolidaysComponent,
              resolve: {
                offices: OfficesResolver
              }
            },
            {
              path: ':id',
              data: { title: extract('View Holidays'), routeParamBreadcrumb: 'id' },
              children: [
                {
                  path: '',
                  component: ViewHolidaysComponent,
                  resolve: {
                    holidays: HolidayResolver
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

/**
 * Organization Routing Module
 *
 * Configures the organization routes.
 */
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [
    LoanProvisioningCriteriaResolver,
    OfficesResolver,
    EmployeesResolver,
    EmployeeResolver,
    EditEmployeeResolver,
    CurrenciesResolver,
    SmsCampaignsResolver,
    SmsCampaignResolver,
    AdhocQueriesResolver,
    AdhocQueryResolver,
    TellersResolver,
    TellerResolver,
    PaymentTypesResolver,
    PaymentTypeResolver,
    PasswordPreferencesTemplateResolver,
    EntityDataTableChecksResolver,
    WorkingDaysResolver,
    EditOfficeResolver,
    AdhocQueryTemplateResolver,
    LoanProvisioningCriteriasResolver,
    CashierResolver,
    CashiersResolver,
    HolidayResolver,
    OfficeResolver,
    OfficeDatatableResolver,
    OfficeDatatablesResolver,
    ManageFundsResolver
  ]
})
export class OrganizationRoutingModule { }
