import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { Route, extract } from '../core';
import { SettingsComponent } from './settings.component';

const routes: Routes = [
  Route.withShell([
    {
      path: 'settings',
      component: SettingsComponent,
      data: { title: extract('Settings'), breadcrumb: 'Settings' }
    }
  ])
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class SettingsRoutingModule { }
