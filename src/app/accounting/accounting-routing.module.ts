import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AccountingComponent } from './accounting.component';

const routes: Routes = [
  { path: 'accounting', component: AccountingComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class AccountingRoutingModule { }
