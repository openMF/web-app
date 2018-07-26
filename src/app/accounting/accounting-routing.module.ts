import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { Route, extract } from '../core';
import { AccountingComponent } from './accounting.component';
import { FrequentPostingsComponent } from './frequent-postings/frequent-postings.component';
import { ViewTransactionComponent } from './view-transaction/view-transaction.component';
import { CreateJournalEntryComponent } from './create-journal-entry/create-journal-entry.component';
import { SearchJournalEntryComponent } from './search-journal-entry/search-journal-entry.component';
import { FinancialActivityMappingsComponent } from './financial-activity-mappings/financial-activity-mappings.component';

const routes: Routes = [
  Route.withShell([
    {
      path: 'accounting',
      data: { title: extract('Accounting'), breadcrumb: 'Accounting' },
      children: [
        {
          path: '',
          component: AccountingComponent
        },
        {
          path: 'frequent-postings',
          component: FrequentPostingsComponent,
          data: { title: extract('Frequent Postings'), breadcrumb: 'Frequent Postings' }
        },
        {
          path: 'transactions',
          data: { title: extract('Transactions'), breadcrumb: 'Transactions' },
          children: [
            {
              path: 'view/:id',
              component: ViewTransactionComponent,
              data: { title: extract('View Transaction'), routeParamBreadcrumb: 'id' }
            }
          ]
        },
        {
          path: 'journal-entries',
          component: SearchJournalEntryComponent,
          data: { title: extract('Search Journal Entry'), breadcrumb: 'Search Journal Entry' }
        },
        {
          path: 'journal-entries/create',
          component: CreateJournalEntryComponent,
          data: { title: extract('Create Journal Entry'), breadcrumb: 'Create Journal Entry' }
        },
        {
          path: 'financial-activity-mappings',
          component: FinancialActivityMappingsComponent,
          data: { title: extract('Financial Activity Mappings'), breadcrumb: 'Financial Activity Mappings' }
        }
      ]
    }
  ])
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class AccountingRoutingModule { }
