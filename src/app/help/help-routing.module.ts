/** Angular Imports */
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/** Routing Imports */
import { Route } from '../core/route/route.service';

/* Translation Imports */
import { extract } from '../core/i18n/i18n.service';

/* Custom Components */
import { KeyboardShortcutsComponent } from './keyboard-shortcuts/keyboard-shortcuts.component';
import { HelpComponent } from './help.component';

/** Help Routes */
const routes: Routes = [
  Route.withShell([
    {
      path: 'help',
      component: HelpComponent,
      data: { title: extract('Help'), breadcrumb: 'Help', addBreadcrumbLink: false },
      children: [
        {
          path: 'keyboard-shortcuts',
          component: KeyboardShortcutsComponent,
          data: { title: extract('Keyboard Shortcuts'), breadcrumb: 'Keyboard Shortcuts' }
        }
      ]
    }
  ])
];

/**
 * Help Routing Module
 *
 * Configures the help routes.
 */
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HelpRoutingModule { }
