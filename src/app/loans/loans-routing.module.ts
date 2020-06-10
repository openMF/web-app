/** Angular Imports */
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/** Translation Imports */
import { extract } from '../core/i18n/i18n.service';

/** Custom Components */
import { AddLoanChargeComponent } from './add-loan-charge/add-loan-charge.component';
import { LoansViewComponent } from './loans-view/loans-view.component';
import { GeneralTabComponent } from './loans-view/general-tab/general-tab.component';
import { AccountDetailsComponent } from './loans-view/account-details/account-details.component';
import { NotesTabComponent } from './loans-view/notes-tab/notes-tab.component';
import { RepaymentScheduleTabComponent } from './loans-view/repayment-schedule-tab/repayment-schedule-tab.component';
import { TransactionsTabComponent } from './loans-view/transactions-tab/transactions-tab.component';
import { OriginalScheduleTabComponent } from './loans-view/original-schedule-tab/original-schedule-tab.component';
import { OverdueChargesTabComponent } from './loans-view/overdue-charges-tab/overdue-charges-tab.component';
import { ChargesTabComponent } from './loans-view/charges-tab/charges-tab.component';
import { DatatableTabComponent } from './loans-view/datatable-tab/datatable-tab.component';

/** Custom Resolvers */
import { LoanChargeTemplateResolver } from './common-resolvers/loan-charge-template.resolver';
import { LoanDetailsResolver } from './common-resolvers/loan-details.resolver';
import { LoanDetailsGeneralResolver } from './common-resolvers/loan-details-general.resolver';
import { LoanNotesResolver } from './common-resolvers/loan-notes-resolver';
import { LoanDetailsChargesResolver } from './common-resolvers/loan-details-charges.resolver';
import { LoanAccountActionsComponent } from './loans-view/loan-account-actions/loan-account-actions.component';
import { LoanDatatablesResolver } from './common-resolvers/loan-datatables.resolver';
import { LoanDatatableResolver } from './common-resolvers/loan-datatable.resolver';

const routes: Routes = [
  {
    path: '',
    // Component to View All existing Loans Comes Here
    children: [{
      path: ':loanId',
      data: { title: extract('Loan View'), routeParamBreadcrumb: 'loanId' },
      component: LoansViewComponent,
      resolve: {
        loanDetailsData: LoanDetailsResolver,
        loanDatatables: LoanDatatablesResolver,
      },
      // Component For Loan View Comes Here
      children: [
        {
          path: 'general',
          component: GeneralTabComponent,
          data: { title: extract('General'), breadcrumb: 'General', routeParamBreadcrumb: false },
          resolve: {
            loanDetailsData: LoanDetailsGeneralResolver
          }
        },
        {
          path: 'accountdetail',
          component: AccountDetailsComponent,
          data: { title: extract('Account Detail'), breadcrumb: 'Account Detail', routeParamBreadcrumb: false },
          resolve: {
            loanDetailsData: LoanDetailsGeneralResolver
          }
        },
        {
          path: 'original-schedule',
          component: OriginalScheduleTabComponent,
          data: { title: extract('Original Schedule'), breadcrumb: 'Original Schedule', routeParamBreadcrumb: false },
          resolve: {
            loanDetailsAssociationData: LoanDetailsChargesResolver
          }
        },
        {
          path: 'repayment-schedule',
          component: RepaymentScheduleTabComponent,
          data: { title: extract('Repayment Schedule'), breadcrumb: 'Repayment Schedule', routeParamBreadcrumb: false },
          resolve: {
            loanDetailsAssociationData: LoanDetailsChargesResolver
          }
        },
        {
          path: 'transactions',
          component: TransactionsTabComponent,
          data: { title: extract('Transactions'), breadcrumb: 'Transactions', routeParamBreadcrumb: false },
          resolve: {
            loanDetailsAssociationData: LoanDetailsChargesResolver
          }
        },
        {
          path: 'overdue-charges',
          component: OverdueChargesTabComponent,
          data: { title: extract('Overdue Charges'), breadcrumb: 'Overdue Charges', routeParamBreadcrumb: false },
          resolve: {
            loanDetailsData: LoanDetailsGeneralResolver
          }
        },
        {
          path: 'charges',
          component: ChargesTabComponent,
          data: { title: extract('Charges'), breadcrumb: 'Charges', routeParamBreadcrumb: false },
          resolve: {
            loanDetailsAssociationData: LoanDetailsChargesResolver
          }
        },
        {
          path: 'notes',
          component: NotesTabComponent,
          data: { title: extract('Notes'), breadcrumb: 'Notes', routeParamBreadcrumb: false },
          resolve: {
            loanNotes: LoanNotesResolver
          },
        },
        {
          path: 'datatables',
          children: [{
            path: ':datatableName',
            component: DatatableTabComponent,
            data: { title: extract('Data Table View'), routeParamBreadcrumb: 'datatableName' },
            resolve: {
              loanDatatable: LoanDatatableResolver
            }
          }]
        },
        {
          path: 'add-loan-charge',
          component: AddLoanChargeComponent,
          data: { title: extract('Add Loan Charge'), breadcrumb: 'Add Loan Charge', routeParamBreadcrumb: false },
          resolve: {
            loanChargeTemplate: LoanChargeTemplateResolver
          }
        },
        {
          path: ':action',
          component: LoanAccountActionsComponent,
          data: { title: extract('Loan Account Actions'), routeParamBreadcrumb: 'action' },
        },
      ]
    }]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  declarations: [],
  providers: [
    LoanChargeTemplateResolver,
    LoanDetailsGeneralResolver,
    LoanDetailsResolver,
    LoanNotesResolver,
    LoanDetailsChargesResolver,
    LoanDatatablesResolver,
    LoanDatatableResolver
  ]
})

export class LoansRoutingModule { }
