import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { Route, extract } from '../core';
import { AccountingComponent } from './accounting.component';
import { FrequentPostingsComponent } from './frequent-postings/frequent-postings.component';

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
