/** Angular Imports */
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/** Routing Imports */
import { Route } from '../core/route/route.service';

/** Translation Imports */
import { extract } from '../core/i18n/i18n.service';

/** Custom Components */
import { TemplatesComponent } from './templates.component';

/** Custom Resolvers */
import { TemplatesResolver } from './templates.resolver';

/** Templates Routes */
const routes: Routes = [
  Route.withShell([
    {
      path: 'templates',
      data: { title: extract('Templates'), breadcrumb: 'Templates' },
      children: [
        {
          path: '',
          component: TemplatesComponent,
          resolve: {
            templates: TemplatesResolver
          }
        }
      ]
    }
  ])
];

/**
 * Templates Routing Module
 *
 * Configures the templates routes.
 */
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [
    TemplatesResolver
  ]
})
export class TemplatesRoutingModule { }
