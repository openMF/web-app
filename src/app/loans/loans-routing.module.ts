/** Angular Imports */
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/** Translation Imports */
import { extract } from '../core/i18n/i18n.service';

/** Custom Components */
import { AddLoanChargeComponent } from './add-loan-charge/add-loan-charge.component';

/** Custom Resolvers */
import { LoanChargeTemplateResolver } from './common-resolvers/loan-charge-template.resolver';
import { LoanTransactionTemplateResolver } from './common-resolvers/loan-transaction-template.resolver';
import { ViewLoanAccountComponent } from './view-loan-account/view-loan-account.component';
import { MakeRepaymentsComponent } from './view-loan-account/make-repayments/make-repayments.component';

const routes: Routes = [
  {
    path: '',
    // Component to View All existing Loans Comes Here
    children: [{
      path: ':loanId',
      data: { title: extract('Loan View'), routeParamBreadcrumb: 'loanId' },
      // Component For Loan View Comes Here
      children: [
        {
          path: 'add-loan-charge',
          component: AddLoanChargeComponent,
          data: { title: extract('Add Loan Charge'), breadcrumb: 'Add Loan Charge', routeParamBreadcrumb: false },
          resolve: {
            loanChargeTemplate: LoanChargeTemplateResolver
          }
        },
        {
          path: 'view-loan-account',
          data: { title: extract('View Loan Account'), breadcrumb: 'View Loan Account', routeParamBreadcrumb: false },
          children: [
            {
              path: '',
              component: ViewLoanAccountComponent,
            },
            {
              path: 'repayment',
              data: { title: extract('Make Repayment'), breadcrumb: 'Make Repayment', routeParamBreadcrumb: false },
              component: MakeRepaymentsComponent,
              resolve: {
                loanTransactionTemplate: LoanTransactionTemplateResolver,
              }
            }
          ]
        },
      ]
    }]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  declarations: [],
  providers: [LoanChargeTemplateResolver, LoanTransactionTemplateResolver]
})
export class LoansRoutingModule { }
