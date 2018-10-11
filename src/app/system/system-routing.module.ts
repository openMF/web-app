import { NgModule } from '@angular/core';

/** Routing Imports */
import { Routes, RouterModule } from '@angular/router';
import { Route } from '../core/route/route.service';
import { extract } from '../core/i18n/i18n.service';

/** Component Imports */
import { SystemComponent } from './system.component';
import { CodesComponent } from './codes/codes.component';

/** Custom Resolvers */
import { CodesResolver } from './codes/codes.resolver';

const routes: Routes = [
  Route.withShell([
    {
      path: 'system',
      data: { title: extract('System'), breadcrumb: 'System' },
      children: [
      {
        path: '',
        component: SystemComponent
      },
      {
        path: 'codes',
        component: CodesComponent,
        data: { title: extract('View Codes'), breadcrumb: 'Codes' },
        resolve: {
          codes: CodesResolver
        }
      }
    ]
    }
  ])
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [CodesResolver]
})
export class SystemRoutingModule { }
