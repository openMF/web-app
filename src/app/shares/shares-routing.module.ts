/** Angular Imports */
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/** Routing Imports */
import { Route } from '../core/route/route.service';

/** Translation Imports */
import { extract } from '../core/i18n/i18n.service';

/** Custom Components */
import { SharesComponent } from './shares.component';
import { ViewshareaccountComponent } from './viewshareaccount/viewshareaccount.component';

import { ViewshareaccountResolver } from './viewshareaccount/viewshareaccount.resolver';

/** Home and Dashboard Routes */
const routes: Routes = [
  Route.withShell([
    {
      path: 'shares',
      component: SharesComponent,
      data: { title: extract('Shares') }
    },
    {
      path: 'viewshareaccount/:shareAccountId',
      component: ViewshareaccountComponent,
      data: { title: extract('View Share Account'), breadcrumb: 'View Share Account' },
      resolve: {
        shareAccount: ViewshareaccountResolver
      }
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
  providers: [
    ViewshareaccountResolver
  ]
})
export class SharesRoutingModule {}
