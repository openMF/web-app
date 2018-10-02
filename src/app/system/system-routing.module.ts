import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { Route } from '../core/route/route.service';
import { extract } from '../core/i18n/i18n.service';
import { SystemComponent } from './system.component';

const routes: Routes = [
  Route.withShell([
    {
      path: 'system',
      component: SystemComponent,
      data: { title: extract('System'), breadcrumb: 'System' }
    }
  ])
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SystemRoutingModule { }
