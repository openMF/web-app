/** Angular Imports */
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/** Routing Imports */
import { Route } from '../core/route/route.service';

/** Translation Imports */
import { extract } from '../core/i18n/i18n.service';

/** Custom Components */
import { ViewShareAccountComponent } from './view-share-account/view-share-account.component';
import { SharesComponent } from './shares.component';

/** Custom Resolvers */
import { ShareAccountResolver } from './common-resolvers/share-account.resolver';

/** Shares Routes */
const routes: Routes = [
 {
    path: '',
    data: { title: extract('Shares'), breadcrumb: 'Share Account' },
    children: [
      {
        path: ':shareAccountId',
        data: { title: extract('View Share Account'), routeParamBreadcrumb: 'shareAccountId'},
        component: ViewShareAccountComponent,
        resolve: {
          shareAccountData: ShareAccountResolver
        }
      }
    ]
  }
];

/**
 * Shares Routing Module
 *
 * Configures the shares routes.
 */
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [
    ShareAccountResolver
  ]
})
export class SharesRoutingModule { }
