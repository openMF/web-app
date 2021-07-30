/** Angular Imports */
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/** Translation Imports */
import { extract } from '../core/i18n/i18n.service';

/** Custom Components */
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
import { LoanAccountActionsComponent } from './loans-view/loan-account-actions/loan-account-actions.component';
import { FloatingInterestRatesComponent } from './loans-view/floating-interest-rates/floating-interest-rates.component';
import { LoanTrancheDetailsComponent } from './loans-view/loan-tranche-details/loan-tranche-details.component';
import { LoanCollateralTabComponent } from './loans-view/loan-collateral-tab/loan-collateral-tab.component';
import { CreateLoansAccountComponent } from './create-loans-account/create-loans-account.component';
import { LoanDocumentsTabComponent } from './loans-view/loan-documents-tab/loan-documents-tab.component';
import { StandingInstructionsTabComponent } from 'app/loans/loans-view/standing-instructions-tab/standing-instructions-tab.component';
import { EditLoansAccountComponent } from './edit-loans-account/edit-loans-account.component';
import { ViewChargeComponent } from './loans-view/view-charge/view-charge.component';
import { ViewTransactionComponent } from './loans-view/transactions/view-transaction/view-transaction.component';
import { EditTransactionComponent } from './loans-view/transactions/edit-transaction/edit-transaction.component';
import { ViewRecieptComponent } from './loans-view/transactions/view-reciept/view-reciept.component';
import { ExportTransactionsComponent } from './loans-view/transactions/export-transactions/export-transactions.component';
import { CreditScorecardComponent } from './loans-view/credit-scorecard/credit-scorecard.component';

/** Custom Resolvers */
import { LoanDetailsResolver } from './common-resolvers/loan-details.resolver';
import { LoanNotesResolver } from './common-resolvers/loan-notes.resolver';
import { LoanDatatablesResolver } from './common-resolvers/loan-datatables.resolver';
import { LoanDatatableResolver } from './common-resolvers/loan-datatable.resolver';
import { LoanActionButtonResolver } from './common-resolvers/loan-action-button.resolver';
import { LoansAccountTemplateResolver } from './common-resolvers/loans-account-template.resolver';
import { LoanDocumentsResolver } from './common-resolvers/loan-documents.resolver';
import { LoansAccountAndTemplateResolver } from './common-resolvers/loans-account-and-template.resolver';
import { LoansAccountChargeResolver } from './common-resolvers/loans-account-charge.resolver';
import { LoansAccountTransactionResolver } from './common-resolvers/loans-account-transaction.resolver';
import { LoansTransactionRecieptResolver } from './common-resolvers/loans-transaction-reciept.resolver';
import { LoansAccountTransactionTemplateResolver } from './common-resolvers/loans-account-transaction-template.resolver';

/** Loans Route. */
const routes: Routes = [
  {
    path: '',
    data: { title: extract('Loans'), breadcrumb: 'Loans', routeParamBreadcrumb: false },
    children: [
      {
        path: 'create',
        data: { title: extract('Create Loans Account'), breadcrumb: 'Create Loans Account' },
        component: CreateLoansAccountComponent,
        resolve: {
          loansAccountTemplate: LoansAccountTemplateResolver
        }
      },
      {
      path: ':loanId',
      data: { title: extract('Loan View'), routeParamBreadcrumb: 'loanId' },
      children: [
        {
          path: '',
          component: LoansViewComponent,
          resolve: {
            loanDetailsData: LoanDetailsResolver,
            loanDatatables: LoanDatatablesResolver,
          },
          children: [
            {
              path: 'general',
              component: GeneralTabComponent,
              data: { title: extract('General'), breadcrumb: 'General', routeParamBreadcrumb: false }
            },
            {
              path: 'accountdetail',
              component: AccountDetailsComponent,
              data: { title: extract('Account Detail'), breadcrumb: 'Account Detail', routeParamBreadcrumb: false }
            },
            {
              path: 'creditscorecard',
              component: CreditScorecardComponent,
              data: { title: extract('Credit Scorecard'), breadcrumb: 'Credit Scorecard', routeParamBreadcrumb: false }
            },
            {
              path: 'original-schedule',
              component: OriginalScheduleTabComponent,
              data: { title: extract('Original Schedule'), breadcrumb: 'Original Schedule', routeParamBreadcrumb: false },
            },
            {
              path: 'repayment-schedule',
              component: RepaymentScheduleTabComponent,
              data: { title: extract('Repayment Schedule'), breadcrumb: 'Repayment Schedule', routeParamBreadcrumb: false },
            },
            {
              path: 'transactions',
              data: { title: extract('Loans Account Transactions'), breadcrumb: 'Transactions', routeParamBreadcrumb: false },
              children: [
                {
                  path: '',
                  component: TransactionsTabComponent

                },
                {
                  path: 'export',
                  component: ExportTransactionsComponent
                }
              ]
            },
            {
              path: 'loan-collateral',
              component: LoanCollateralTabComponent,
              data: { title: extract('Loan Collateral Details'), breadcrumb: 'Loan Collateral Details', routeParamBreadcrumb: false },
            },
            {
              path: 'loan-tranche-details',
              component: LoanTrancheDetailsComponent,
              data: { title: extract('Loan Tranche Details'), breadcrumb: 'Loan Tranche Details', routeParamBreadcrumb: false },
            },
            {
              path: 'overdue-charges',
              component: OverdueChargesTabComponent,
              data: { title: extract('Overdue Charges'), breadcrumb: 'Overdue Charges', routeParamBreadcrumb: false }
            },
            {
              path: 'floating-interest-rates',
              component: FloatingInterestRatesComponent,
              data: { title: extract('Floating Interest Rates'), breadcrumb: 'Floating Interest Rates', routeParamBreadcrumb: false },
            },
            {
              path: 'charges',
              data: { title: extract('Loans Account Charges'), breadcrumb: 'Charges', routeParamBreadcrumb: false },
              component: ChargesTabComponent,
            },
            {
              path: 'loan-documents',
              component: LoanDocumentsTabComponent,
              data: { title: extract('Loan Documents'), breadcrumb: 'Loan Documents', routeParamBreadcrumb: false },
              resolve: {
                loanDocuments: LoanDocumentsResolver
              },
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
              path: 'standing-instruction',
              component: StandingInstructionsTabComponent,
              data: { title: extract('Standing Instructions'), breadcrumb: 'Standing Instructions', routeParamBreadcrumb: false }
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
          ],
        },
        {
          path: 'transactions',
          data: { title: extract('Loans Account Transactions'), breadcrumb: 'Transactions', routeParamBreadcrumb: false },
          resolve: {
            loanDetailsAssociationData: LoanDetailsResolver
          },
          children: [
            {
              path: '',
              redirectTo: '../transactions', pathMatch: 'prefix'
            },
            {
              path: ':id',
              data: { routeParamBreadcrumb: 'id' },
              children: [
                {
                  path: '',
                  component: ViewTransactionComponent,
                  resolve: {
                    loansAccountTransaction: LoansAccountTransactionResolver
                  }
                },
                {
                  path: 'edit',
                  component: EditTransactionComponent,
                  data: { breadcrumb: 'Edit', routeParamBreadcrumb: false },
                  resolve: {
                    loansAccountTransactionTemplate: LoansAccountTransactionTemplateResolver
                  }
                },
                {
                  path: 'reciept',
                  component: ViewRecieptComponent,
                  data: { breadcrumb: 'Reciept', routeParamBreadcrumb: false },
                  resolve: {
                    loansTransactionReciept: LoansTransactionRecieptResolver
                  }
                }
              ]
            }
          ]
        },
        {
          path: 'charges',
          data: { title: extract('Loans Account Charges'), breadcrumb: 'Charges', routeParamBreadcrumb: false },
          children: [
            {
              path: '',
              redirectTo: '../charges', pathMatch: 'prefix'
            },
            {
              path: ':id',
              data: { routeParamBreadcrumb: 'id' },
              component: ViewChargeComponent,
              resolve: {
                loansAccountCharge: LoansAccountChargeResolver,
                loanDetailsData: LoanDetailsResolver
              }
            }
          ]
        },
        {
          path: 'actions/:action',
          component: LoanAccountActionsComponent,
          data: { title: extract('Loan Account Actions'), routeParamBreadcrumb: 'action' },
          resolve: {
            actionButtonData: LoanActionButtonResolver
          }
        },
        {
          path: 'transfer-funds',
          loadChildren: () => import('../account-transfers/account-transfers.module').then(m => m.AccountTransfersModule)
        },
        {
          path: 'edit-loans-account',
          data: { title: extract('Edit Loans Account'), breadcrumb: 'Edit Loans Account', routeParamBreadcrumb: 'Edit' },
          component: EditLoansAccountComponent,
          resolve: {
            loansAccountAndTemplate: LoansAccountAndTemplateResolver
          }
        },
      ]
    }]
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  declarations: [],
  providers: [
    LoanDetailsResolver,
    LoanNotesResolver,
    LoanDatatablesResolver,
    LoanDatatableResolver,
    LoanActionButtonResolver,
    LoansAccountTemplateResolver,
    LoanDocumentsResolver,
    LoansAccountAndTemplateResolver,
    LoansAccountChargeResolver,
    LoansAccountTransactionResolver,
    LoansAccountTransactionTemplateResolver,
    LoansTransactionRecieptResolver
  ]
})

export class LoansRoutingModule { }
