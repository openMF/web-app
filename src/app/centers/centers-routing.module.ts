import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/** Routing Imports */
import { Route } from '../core/route/route.service';

/** Translation Imports */
import { extract } from '../core/i18n/i18n.service';

/** Custom Components */
import { CentersComponent } from './centers.component';
import { CreateCenterComponent } from './create-center/create-center.component';
import { CentersViewComponent } from './centers-view/centers-view.component';
import { GeneralTabComponent } from './centers-view/general-tab/general-tab.component';
import { NotesTabComponent } from './centers-view/notes-tab/notes-tab.component';
import { DatatableTabComponent } from './centers-view/datatable-tab/datatable-tab.component';

/** Custom Resolvers */
import { OfficesResolver } from 'app/accounting/common-resolvers/offices.resolver';
import { CenterViewResolver } from './common-resolvers/center-view.resolver';
import { SavingsAccountResolver } from './common-resolvers/savings-account.resolver';
import { CenterResourceResolver } from './common-resolvers/center-resource.resolver';
import { CenterSummaryResolver } from './common-resolvers/center-summary.resolver';
import { CenterNotesResolver } from './common-resolvers/center-notes.resolver';
import { CenterDatatableResolver } from './common-resolvers/center-datatable.resolver';
import { CenterDatatablesResolver } from './common-resolvers/center-datatables.resolver';

const routes: Routes = [
  Route.withShell([

    {
      path: 'centers',
      data: { title: extract('Centers'), breadcrumb: 'Centers' },
      children: [
        {
          path: '',
          component: CentersComponent
        },
        {
          path: 'create',
          component: CreateCenterComponent,
          data: { title: extract('Create Center'), breadcrumb: 'Create' },
          resolve: {
            offices: OfficesResolver,
          }
        },
        {
          path: ':centerId',
          component: CentersViewComponent,
          data: { title: extract('Centers View'), routeParamBreadcrumb: 'centerId' },
          resolve: {
            centerViewData: CenterViewResolver,
            centerDatatables: CenterDatatablesResolver
          },
          children: [
            {
              path: 'general',
              component: GeneralTabComponent,
              data: { title: extract('General'), breadcrumb: 'General', routeParamBreadcrumb: false },
              resolve: {
                centerSummaryData: CenterSummaryResolver,
                centerViewData: CenterResourceResolver,
                savingsAccountData: SavingsAccountResolver
              }
            },
            {
              path: 'notes',
              component: NotesTabComponent,
              data: { title: extract('Notes'), breadcrumb: 'Notes', routeParamBreadcrumb: false },
              resolve: {
                centerNotes: CenterNotesResolver
              }
            },
            {
              path: 'datatables',
              children: [{
                path: ':datatableName',
                component: DatatableTabComponent,
                data: { title: extract('Data Table View'), routeParamBreadcrumb: 'datatableName' },
                resolve: {
                  centerDatatable: CenterDatatableResolver
                }
              }]
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
    CenterDatatablesResolver
  ]
})
export class CentersRoutingModule { }
