import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/** Routing Imports */
import { Route } from '../core/route/route.service';

/** Translation Imports */
import { extract } from '../core/i18n/i18n.service';

import { CentersComponent } from './centers.component';
import { CreateCenterComponent } from './create-center/create-center.component';
import { OfficesResolver } from 'app/accounting/common-resolvers/offices.resolver';

const routes: Routes = [
  Route.withShell([

    {
      path: 'centers',
      data: { title: extract('Centers'), breadcrumb: 'Centers' },
      children: [
        {
          path: '',
          component: CentersComponent
        },
        {
          path: 'create',
          component: CreateCenterComponent,
          data: { title: extract('Create Center'), breadcrumb: 'Create' },
          resolve: {
            offices: OfficesResolver,
          }
        }
      ]
    }
  ])
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [OfficesResolver]
})
export class CentersRoutingModule { }
