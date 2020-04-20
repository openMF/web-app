/** Angular Imports */
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/** Translation Imports */
import { extract } from '../core/i18n/i18n.service';

/** Custom Components */
import { AddLoanChargeComponent } from './add-loan-charge/add-loan-charge.component';
import { CreateLoanAccountComponent } from './create-loan-account/create-loan-account.component';
import { EditLoanAccountComponent } from './edit-loan-account/edit-loan-account.component';

/** Custom Resolvers */
import { LoanChargeTemplateResolver } from './common-resolvers/loan-charge-template.resolver';
import { LoanAccountsTemplateResolver } from './common-resolvers/loan-accounts-template.resolver';

const routes: Routes = [
  {
    path: 'create',
    component: CreateLoanAccountComponent,
    data: { title: extract('Create Saving Product'), breadcrumb: 'Create' },
    resolve: {
      loanAccountsTemplate: LoanAccountsTemplateResolver
    }
  },
  {
    path: ':loanId',
    data: { title: extract('View Loan Account'), routeParamBreadcrumb: 'loanId' },
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
        path: 'edit',
        component: EditLoanAccountComponent,
        data: { title: extract('Edit Loan Account'), breadcrumb: 'Edit', routeParamBreadcrumb: false },
        resolve: {
          // savingProductAndTemplate: SavingProductAndTemplateResolver
        }
      }
    ]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  declarations: [],
  providers: [LoanChargeTemplateResolver, LoanAccountsTemplateResolver]
})
export class LoansRoutingModule {}
