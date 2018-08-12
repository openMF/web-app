/** Angular Imports */
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/** Routing Imports */
import { Route } from '../core';

/** Translation Imports */
import { extract } from '../core';

/** Custom Components */
import { SettingsComponent } from './settings.component';

/** Settings Routes */
const routes: Routes = [
  Route.withShell([
    {
      path: 'settings',
      component: SettingsComponent,
      data: { title: extract('Settings'), breadcrumb: 'Settings' }
    }
  ])
];

/**
 * Settings Routing Module
 *
 * Configures the settings and web app configuration routes.
 */
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class SettingsRoutingModule { }
