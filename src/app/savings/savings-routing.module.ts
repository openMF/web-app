/** Angular Imports */
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/** Routing Imports */
import { Route } from '../core/route/route.service';

/** Translation Imports */
import { extract } from '../core/i18n/i18n.service';

/** Custom Components */
import {SavingsApplicationComponent} from './savings-application/savings-application.component';
import {SavingsComponent} from './savings.component';

/** Savings Routes */
const routes: Routes = [
  Route.withShell([
    {
      path: 'savings',
      data: { title: extract('Savings'), breadcrumb: 'Savings' },
      component: SavingsComponent
    },
    {
      path: 'savings/savings-application',
      data: { title: extract('Savings Application'), breadcrumb: 'Savings Application'},
      component: SavingsApplicationComponent
    },
  ])
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SavingsRoutingModule { }
