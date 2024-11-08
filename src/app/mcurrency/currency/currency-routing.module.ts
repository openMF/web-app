/** Angular Imports */
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/** Routing Imports */
import { Route } from '../../core/route/route.service';

/** Custom Components */
import { CurrencyComponent } from './currency.component';

/** Custom Resolvers */
import { OfficesResolver } from '../../accounting/common-resolvers/offices.resolver';

/** Home and Dashboard Routes */
const routes: Routes = [
  Route.withShell([
    {
      path: 'currency',
      redirectTo: '/currency',
      pathMatch: 'full'
    },
    {
      path: 'currency',
      component: CurrencyComponent,
      data: { title: 'Multi-Currency' }
    }
  ])
];

/**
 * Home Routing Module
 *
 * Configures the home and dashboard routes.
 */
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [OfficesResolver]
})
export class HomeRoutingModule { }
