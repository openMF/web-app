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

/** Custom Resolvers */
import { LoanChargeTemplateResolver } from './common-resolvers/loan-charge-template.resolver';
import { LoanDetailsResolver } from './common-resolvers/loan-details.resolver';
import { LoanDetailsGeneralResolver } from './common-resolvers/loan-details-general.resolver';
import { LoanNotesResolver } from './common-resolvers/loan-notes-resolver';
import { ChargesTabComponent } from './loans-view/charges-tab/charges-tab.component';
import { LoanDetailsChargesResolver } from './common-resolvers/loan-details-charges.resolver';
import { OverdueChargesTabComponent } from './loans-view/overdue-charges-tab/overdue-charges-tab.component';
import { OriginalScheduleTabComponent } from './loans-view/original-schedule-tab/original-schedule-tab.component';
import { RepaymentScheduleTabComponent } from './loans-view/repayment-schedule-tab/repayment-schedule-tab.component';
import { TransactiosTabComponent } from './loans-view/transactios-tab/transactios-tab.component';

const routes: Routes = [
  {
    path: '',
    // Component to View All existing Loans Comes Here
    children: [{
      path: ':loanId',
      data: { title: extract('Loan View'), routeParamBreadcrumb: 'loanId' },
      component: LoansViewComponent,
      resolve: {
        loanDetailsData: LoanDetailsResolver
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
          component: TransactiosTabComponent,
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
          path: 'add-loan-charge',
          component: AddLoanChargeComponent,
          data: { title: extract('Add Loan Charge'), breadcrumb: 'Add Loan Charge', routeParamBreadcrumb: false },
          resolve: {
            loanChargeTemplate: LoanChargeTemplateResolver
          }
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
    LoanDetailsChargesResolver
  ]
})

export class LoansRoutingModule { }
