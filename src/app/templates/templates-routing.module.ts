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
import { EditTemplateComponent } from './edit-template/edit-template.component';
import { CreateTemplateComponent } from './create-template/create-template.component';

/** Custom Resolvers */
import { TemplatesResolver } from './common-resolvers/templates.resolver';
import { TemplateResolver } from './common-resolvers/template.resolver';
import { EditTemplateResolver } from './common-resolvers/edit-template.resolver';
import { CreateTemplateResolver } from './common-resolvers/create-template.resolver';

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
          path: 'create',
          data: { title: extract('Create Template'), breadcrumb: 'Create Template' },
          component: CreateTemplateComponent,
          resolve: {
            createTemplateData: CreateTemplateResolver
          }
        },
        {
          path: ':id',
          data: { title: extract('View Template'), routeParamBreadcrumb: 'id' },
          children: [
            {
              path: '',
              component: ViewTemplateComponent,
              resolve: {
                template: TemplateResolver
              }
            },
            {
              path: 'edit',
              component: EditTemplateComponent,
              data: { title: extract('Edit Template'), breadcrumb: 'Edit', routeParamBreadcrumb: false },
              resolve: {
                editTemplateData: EditTemplateResolver
              }
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
    TemplateResolver,
    EditTemplateResolver,
    CreateTemplateResolver
  ]
})
export class TemplatesRoutingModule { }
