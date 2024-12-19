import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/** Routing Imports */
import { Route } from '../core/route/route.service';

/** Custom Components */
import { CentersComponent } from './centers.component';
import { CreateCenterComponent } from './create-center/create-center.component';
import { CentersViewComponent } from './centers-view/centers-view.component';
import { GeneralTabComponent } from './centers-view/general-tab/general-tab.component';
import { NotesTabComponent } from './centers-view/notes-tab/notes-tab.component';
import { DatatableTabComponent } from './centers-view/datatable-tab/datatable-tab.component';
import { EditCenterComponent } from './edit-center/edit-center.component';

/** Custom Resolvers */
import { OfficesResolver } from 'app/accounting/common-resolvers/offices.resolver';
import { CenterViewResolver } from './common-resolvers/center-view.resolver';
import { SavingsAccountResolver } from './common-resolvers/savings-account.resolver';
import { CenterResourceResolver } from './common-resolvers/center-resource.resolver';
import { CenterSummaryResolver } from './common-resolvers/center-summary.resolver';
import { CenterNotesResolver } from './common-resolvers/center-notes.resolver';
import { CenterDatatableResolver } from './common-resolvers/center-datatable.resolver';
import { CenterDatatablesResolver } from './common-resolvers/center-datatables.resolver';
import { CenterActionsComponent } from './centers-view/center-actions/center-actions.component';
import { CenterActionsResolver } from './common-resolvers/center-actions.resolver';
import { CenterDataAndTemplateResolver } from './common-resolvers/center-data-and-template.resolver';

const routes: Routes = [
  Route.withShell([
    {
      path: 'centers',
      data: { title: 'Centers', breadcrumb: 'Centers' },
      children: [
        {
          path: '',
          component: CentersComponent
        },
        {
          path: 'create',
          component: CreateCenterComponent,
          data: { title: 'Create Center', breadcrumb: 'Create' },
          resolve: {
            offices: OfficesResolver
          }
        },
        {
          path: ':centerId',
          data: { title: 'Centers View', routeParamBreadcrumb: 'centerId' },
          resolve: {
            centerViewData: CenterViewResolver
          },
          children: [
            {
              path: '',
              component: CentersViewComponent,
              resolve: {
                centerViewData: CenterViewResolver,
                centerDatatables: CenterDatatablesResolver
              },
              children: [
                {
                  path: 'general',
                  component: GeneralTabComponent,
                  data: { title: 'General', breadcrumb: 'General', routeParamBreadcrumb: false },
                  resolve: {
                    centerSummaryData: CenterSummaryResolver,
                    centerViewData: CenterResourceResolver,
                    savingsAccountData: SavingsAccountResolver
                  }
                },
                {
                  path: 'notes',
                  component: NotesTabComponent,
                  data: { title: 'Notes', breadcrumb: 'Notes', routeParamBreadcrumb: false },
                  resolve: {
                    centerNotes: CenterNotesResolver
                  }
                },
                {
                  path: 'datatables',
                  children: [
                    {
                      path: ':datatableName',
                      component: DatatableTabComponent,
                      data: { title: 'Data Table View', routeParamBreadcrumb: 'datatableName' },
                      resolve: {
                        centerDatatable: CenterDatatableResolver
                      }
                    }
                  ]
                }
              ]
            },
            {
              path: 'edit',
              component: EditCenterComponent,
              data: { title: 'Edit Center', breadcrumb: 'Edit', routeParamBreadcrumb: 'Edit' },
              resolve: {
                centerData: CenterDataAndTemplateResolver
              }
            },
            {
              path: 'actions/:name',
              data: { title: 'Center Actions', routeParamBreadcrumb: 'name' },
              component: CenterActionsComponent,
              resolve: {
                centersActionData: CenterActionsResolver
              }
            },
            {
              path: 'savings-accounts',
              loadChildren: () => import('../savings/savings.module').then((m) => m.SavingsModule)
            }
          ]
        }
      ]
    }
  ])

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [
    OfficesResolver,
    CenterViewResolver,
    SavingsAccountResolver,
    CenterResourceResolver,
    CenterSummaryResolver,
    CenterNotesResolver,
    CenterDatatableResolver,
    CenterDatatablesResolver,
    CenterActionsResolver,
    CenterDataAndTemplateResolver
  ]
})
export class CentersRoutingModule {}
