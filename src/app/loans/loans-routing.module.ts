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
          }
        },
        {
          path: 'add-loan-charge',
          component: AddLoanChargeComponent,
          data: { title: extract('Add Loan Charge'), breadcrumb: 'Add Loan Charge', routeParamBreadcrumb: false },
          resolve: {
            loanChargeTemplate: LoanChargeTemplateResolver
          }
        }
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
