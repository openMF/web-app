/** Angular Imports */
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/** Routing Imports */
import { Route } from '../core/route/route.service';

/** Custom Components */
import { TemplatesComponent } from './templates.component';
import { ViewTemplateComponent } from './view-template/view-template.component';
import { CreateEditComponent } from './create-edit-template/create-edit-template.component';

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
      data: { title: 'Templates', breadcrumb: 'Templates' },
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
          component: CreateEditComponent,
          data: { mode: 'create', breadcrumb: 'Create Template' },
          resolve: { templateData: CreateTemplateResolver }
        },
        {
          path: ':id',
          data: { title: 'View Template', routeParamBreadcrumb: 'id' },
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
              component: CreateEditComponent,
              data: { mode: 'edit', breadcrumb: 'Edit', routeParamBreadcrumb: false },
              resolve: { templateData: EditTemplateResolver }
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
export class TemplatesRoutingModule {}
