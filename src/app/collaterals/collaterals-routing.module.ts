import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

/** Translation Imports */
import { extract } from '../core/i18n/i18n.service';

/** Custom Components */
import { ViewCollateralComponent } from './view-collateral/view-collateral.component';

/** Custom Resolvers */
import { ClientCollateralResolver } from './common-resolvers/client-collateral.resolver';
import { EditCollateralComponent } from './edit-collateral/edit-collateral.component';

const routes: Routes = [
  {
    path: '',
    data: { title: extract('Collateral'), breadcrumb: 'Collateral', routeParamBreadcrumb: false },
    children: [
      {
        path: ':collateralId',
        data: { title: extract('Collateral View'), routeParamBreadcrumb: 'collateralId' },
        children: [
          {
            path: '',
            component: ViewCollateralComponent,
            resolve: {
              clientCollateralData: ClientCollateralResolver,
            }
          },
          {
            path: 'edit',
            data: { title: extract('edit'), routeParamBreadcrumb: 'edit' },
            component: EditCollateralComponent,
            resolve: {
              clientCollateralData: ClientCollateralResolver,
            }
          }
        ]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  declarations: [],
  providers: [
    ClientCollateralResolver,
  ]
})
export class CollateralsRoutingModule { }
