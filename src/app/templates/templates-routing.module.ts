/** Angular Imports */
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/** Routing Imports */
import { Route } from '../core/route/route.service';

/** Translation Imports */
import { extract } from '../core/i18n/i18n.service';

/** Custom Components */
import { TemplatesComponent } from './templates.component';
import { ViewTemplateComponent } from './view-template/view-template.component';

/** Custom Resolvers */
import { TemplatesResolver } from './templates.resolver';
import { TemplateResolver } from './template.resolver';

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
        },
        {
          path: ':id',
          data: { title: extract('View Template'), routeResolveBreadcrumb: ['template', 'name'] },
          resolve: {
            template: TemplateResolver
          },
          children: [
            {
              path: '',
              component: ViewTemplateComponent,
            }
          ]
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
    TemplatesResolver,
    TemplateResolver
  ]
})
export class TemplatesRoutingModule { }
