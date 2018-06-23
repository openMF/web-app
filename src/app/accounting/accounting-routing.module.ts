import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { Route, extract } from '../core';
import { AccountingComponent } from './accounting.component';

const routes: Routes = [
  Route.withShell([
    {
      path: 'accounting',
      component: AccountingComponent,
      data: { title: extract('Accounting') }
    }
  ])
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class AccountingRoutingModule { }
