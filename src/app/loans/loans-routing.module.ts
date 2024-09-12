/** Angular Imports */
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/** Custom Components */
import { LoansViewComponent } from './loans-view/loans-view.component';
import { GeneralTabComponent } from './loans-view/general-tab/general-tab.component';
import { AccountDetailsComponent } from './loans-view/account-details/account-details.component';
import { AdddetailTabComponent } from './loans-view/add-details/adddetail.component';
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
import { GlimAccountComponent } from './glim-account/glim-account.component';
import { CreateGlimAccountComponent } from './glim-account/create-glim-account/create-glim-account.component';

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
import { SavingsAccountViewResolver } from 'app/savings/common-resolvers/savings-account-view.resolver';
import { GroupAccountsResolver } from 'app/groups/common-resolvers/group-account.resolver';
import { GLIMViewResolver } from './glim-account/glim-account-view.resolver';
import { GSIMAccountsResolver } from 'app/groups/common-resolvers/gsim-account-resolver';
import { GLIMLoanTemplateResolver } from './common-resolvers/glim-loan-template.resolver';
import { GroupViewResolver } from 'app/groups/common-resolvers/group-view.resolver';
import { LoanDelinquencyTagsResolver } from './common-resolvers/loan-delinquency-tags.resolver';
import { LoanDelinquencyTagsTabComponent } from './loans-view/loan-delinquency-tags-tab/loan-delinquency-tags-tab.component';
import { LoanReschedulesResolver } from './common-resolvers/loan-reschedules.resolver';
import { RescheduleLoanTabComponent } from './loans-view/reschedule-loan-tab/reschedule-loan-tab.component';
import { AdjustLoanChargeComponent } from './loans-view/loan-account-actions/adjust-loan-charge/adjust-loan-charge.component';
import { LoanArrearDelinquencyResolver } from './common-resolvers/loan-arrear-delinquency.resolver';
import { ExternalAssetOwnerTabComponent } from './loans-view/external-asset-owner-tab/external-asset-owner-tab.component';
import { ExternalAssetOwnerResolver } from './common-resolvers/external-asset-owner.resolver';
import { ExternalAssetOwnerActiveTransferResolver } from './common-resolvers/external-asset-owner-active-transfer.resolver';
import { LoanCollateralsResolver } from './common-resolvers/loan-collaterals.resolver';
import { LoanDelinquencyDataResolver } from './common-resolvers/loan-delinquency-data.resolver';
import { LoanDelinquencyActionsResolver } from './common-resolvers/loan-delinquency-actions.resolver';

/** Loans Route. */
const routes: Routes = [
  {
    path: '',
    data: { title: 'Loans', breadcrumb: 'Loans', routeParamBreadcrumb: false },
    children: [
      {
        path: 'create',
        data: { title: 'Create Loans Account', breadcrumb: 'Create Loans Account' },
        component: CreateLoansAccountComponent,
        resolve: {
          loansAccountTemplate: LoansAccountTemplateResolver
        }
      },
      {
        path: ':loanId',
        data: { title: 'Loan View', routeParamBreadcrumb: 'loanId' },
        component: LoansViewComponent,
        resolve: {
          loanDetailsData: LoanDetailsResolver,
          loanDatatables: LoanDatatablesResolver,
          loanArrearsDelinquencyConfig: LoanArrearDelinquencyResolver
        },
        children: [
          {
            path: '',
            redirectTo: 'general',
            pathMatch: 'full'
          },
          {
            path: 'general',
            component: GeneralTabComponent,
            data: { title: 'General', breadcrumb: 'General', routeParamBreadcrumb: false },
            resolve: {
              loanDetailsData: LoanDetailsResolver,
              loanDatatables: LoanDatatablesResolver
            },
          },
          {
            path: 'adddetail',
            component: AdddetailTabComponent,
            data: { title: 'Adddetail', breadcrumb: 'Adddetail', routeParamBreadcrumb: false },
          },
          {
            path: 'accountdetail',
            component: AccountDetailsComponent,
            data: { title: 'Account Detail', breadcrumb: 'Account Detail', routeParamBreadcrumb: false }
          },
          {
            path: 'original-schedule',
            component: OriginalScheduleTabComponent,
            data: { title: 'Original Schedule', breadcrumb: 'Original Schedule', routeParamBreadcrumb: false },
          },
          {
            path: 'repayment-schedule',
            component: RepaymentScheduleTabComponent,
            data: { title: 'Repayment Schedule', breadcrumb: 'Repayment Schedule', routeParamBreadcrumb: false },
          },
          {
            path: 'transactions',
            data: { title: 'Loans Account Transactions', breadcrumb: 'Transactions', routeParamBreadcrumb: false },
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
            path: 'delinquencytags',
            data: { title: 'Loans Delinquency Tags', breadcrumb: 'Delinquency Tags', routeParamBreadcrumb: false },
            resolve: {
              loanDelinquencyTagsData: LoanDelinquencyTagsResolver,
              loanDelinquencyData: LoanDelinquencyDataResolver,
              loanDelinquencyActions: LoanDelinquencyActionsResolver
            },
            children: [
              {
                path: '',
                component: LoanDelinquencyTagsTabComponent
              },
            ]
          },
          {
            path: 'loan-reschedules',
            data: {},
            resolve: {
              loanRescheduleData: LoanReschedulesResolver
            },
            children: [
              {
                path: '',
                component: RescheduleLoanTabComponent
              }
            ]
          },
          {
            path: 'loan-collateral',
            component: LoanCollateralTabComponent,
            data: { title: 'Loan Collateral Details', breadcrumb: 'Loan Collateral Details', routeParamBreadcrumb: false },
            resolve: {
              loanCollaterals: LoanCollateralsResolver
            }
          },
          {
            path: 'loan-tranche-details',
            component: LoanTrancheDetailsComponent,
            data: { title: 'Loan Tranche Details', breadcrumb: 'Loan Tranche Details', routeParamBreadcrumb: false },
          },
          {
            path: 'overdue-charges',
            component: OverdueChargesTabComponent,
            data: { title: 'Overdue Charges', breadcrumb: 'Overdue Charges', routeParamBreadcrumb: false }
          },
          {
            path: 'floating-interest-rates',
            component: FloatingInterestRatesComponent,
            data: { title: 'Floating Interest Rates', breadcrumb: 'Floating Interest Rates', routeParamBreadcrumb: false },
          },
          {
            path: 'charges',
            data: { title: 'Loans Account Charges', breadcrumb: 'Charges', routeParamBreadcrumb: false },
            component: ChargesTabComponent,
          },
          {
            path: 'loan-documents',
            component: LoanDocumentsTabComponent,
            data: { title: 'Loan Documents', breadcrumb: 'Loan Documents', routeParamBreadcrumb: false },
            resolve: {
              loanDocuments: LoanDocumentsResolver
            },
          },
          {
            path: 'notes',
            component: NotesTabComponent,
            data: { title: 'Notes', breadcrumb: 'Notes', routeParamBreadcrumb: false },
            resolve: {
              loanNotes: LoanNotesResolver
            },
          },
          {
            path: 'standing-instruction',
            component: StandingInstructionsTabComponent,
            data: { title: 'Standing Instructions', breadcrumb: 'Standing Instructions', routeParamBreadcrumb: false }
          },
          {
            path: 'external-asset-owner',
            component: ExternalAssetOwnerTabComponent,
            data: { title: 'External Asset Owner', breadcrumb: 'External Asset Owner', routeParamBreadcrumb: false },
            resolve: {
              activeTransferData: ExternalAssetOwnerActiveTransferResolver,
              loanTransfersData: ExternalAssetOwnerResolver
            }
          },
          {
            path: 'datatables',
            children: [{
              path: ':datatableName',
              component: DatatableTabComponent,
              data: { title: 'Data Table View', routeParamBreadcrumb: 'datatableName' },
              resolve: {
                loanDatatable: LoanDatatableResolver
              }
            }]
          },
        ],
      },
      {
        path: ':loanId/transactions/:id',
        data: { title: 'Loans Account Transactions', breadcrumb: 'Transactions', routeParamBreadcrumb: false },
        resolve: {
          loanDetailsAssociationData: LoanDetailsResolver
        },
        children: [
          {
            path: '',
            data: { routeParamBreadcrumb: 'id' },
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
      },
      {
        path: ':loanId/edit-loans-account',
        data: { title: 'Modify Loans Account', breadcrumb: 'Modify Loans Account', routeParamBreadcrumb: 'Edit' },
        component: EditLoansAccountComponent,
        resolve: {
          loansAccountAndTemplate: LoansAccountAndTemplateResolver
        }
      },
      {
        path: ':loanId/charges',
        data: { title: 'Loans Account Charges', breadcrumb: 'Charges', routeParamBreadcrumb: false },
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
          },
          {
            path: ':id/adjustment',
            data: { routeParamBreadcrumb: 'id', breadcrumb: 'Adjustment' },
            component: AdjustLoanChargeComponent,
            resolve: {
              loansAccountCharge: LoansAccountChargeResolver,
              loanDetailsData: LoanDetailsResolver
            }
          }
        ]
      },
      {
        path: ':loanId/actions/:action',
        component: LoanAccountActionsComponent,
        data: { title: 'Loan Account Actions', breadcrumb: 'action', routeParamBreadcrumb: 'action' },
        resolve: {
          actionButtonData: LoanActionButtonResolver
        }
      },
      {
        path: ':loanId/transfer-funds',
        loadChildren: () => import('../account-transfers/account-transfers.module').then(m => m.AccountTransfersModule)
      },
      {
        path: 'edit-loans-account',
        data: { title: 'Modify Loans Account', breadcrumb: 'Modify Loans Account', routeParamBreadcrumb: 'Edit' },
        component: EditLoansAccountComponent,
        resolve: {
          loansAccountAndTemplate: LoansAccountAndTemplateResolver
        }
      },
    ]
  },
  {
    path: 'glim-account',
    children: [
      {
        path: 'create',
        data: { title: 'Create GLIM Application', breadcrumb: 'Create GLIM Application' },
        component: CreateGlimAccountComponent,
        resolve: {
          loansAccountTemplate: GLIMLoanTemplateResolver,
          gsimData: GSIMAccountsResolver,
          groupsData: GroupViewResolver,
        },
      },
      {
        path: ':glimId',
        data: { title: 'GSIM Account View', routeParamBreadcrumb: 'savingAccountId' },
        component: GlimAccountComponent,
        resolve: {
          glimData: GLIMViewResolver,
          groupsData: GroupAccountsResolver
        },
      }
    ]
  }
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
    LoanDelinquencyTagsResolver,
    LoanActionButtonResolver,
    LoansAccountTemplateResolver,
    LoanDocumentsResolver,
    LoansAccountAndTemplateResolver,
    LoansAccountChargeResolver,
    LoansAccountTransactionResolver,
    LoansAccountTransactionTemplateResolver,
    LoansTransactionRecieptResolver,
    SavingsAccountViewResolver,
    GroupAccountsResolver,
    GLIMViewResolver,
    GSIMAccountsResolver,
    GLIMLoanTemplateResolver,
    ExternalAssetOwnerResolver,
    LoanDelinquencyDataResolver
  ]
})

export class LoansRoutingModule { }
