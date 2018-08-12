/** Angular Imports */
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/** Routing Imports */
import { Route } from '../core/route/route.service';

/** Translation Imports */
import { extract } from '../core/i18n/i18n.service';

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
