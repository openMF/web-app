/** Angular Imports */
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/** Routing Imports */
import { Route } from '../core/route/route.service';

/** Translation Imports */
import { extract } from '../core/i18n/i18n.service';

/** Custom Imports */
import { GroupsComponent } from './groups.component';
import { GroupsViewComponent } from './groups-view/groups-view.component';
import { GeneralTabComponent } from './groups-view/general-tab/general-tab.component';
import { NotesTabComponent } from './groups-view/notes-tab/notes-tab.component';
import { CommitteeTabComponent } from './groups-view/committee-tab/committee-tab.component';
import { CreateGroupComponent } from './create-group/create-group.component';
import { DatatableTabsComponent } from './groups-view/datatable-tabs/datatable-tabs.component';

/** Custom Resolvers */
import { GroupViewResolver } from './common-resolvers/group-view.resolver';
import { GroupAccountsResolver } from './common-resolvers/group-account.resolver';
import { GroupSummaryResolver } from './common-resolvers/group-summary.resolver';
import { GroupNotesResolver } from './common-resolvers/group-notes.resolver';
import { OfficesResolver } from 'app/accounting/common-resolvers/offices.resolver';
import { GroupDatatablesResolver } from './common-resolvers/group-datatables.resolver';
import { GroupDatatableResolver } from './common-resolvers/group-datatable.resolver';

/** Groups Routes */
const routes: Routes = [
  Route.withShell([
    {
      path: 'groups',
      data: { title: extract('Groups'), breadcrumb: 'Groups', routeParamBreadcrumb: false },
      children: [
        {
          path: '',
          component: GroupsComponent,
        },
        {
          path: 'create',
          component: CreateGroupComponent,
          data: { title: extract('Create Group'), breadcrumb: 'Create' },
          resolve: {
            offices: OfficesResolver
          }
        },
        {
          path: ':groupId',
          component: GroupsViewComponent,
          data: { title: extract('View Group'), routeParamBreadcrumb: 'groupId' },
          resolve: {
            groupViewData: GroupViewResolver,
            groupDatatables: GroupDatatablesResolver
          },
          children: [
            {
              path: 'general',
              component: GeneralTabComponent,
              data: { title: extract('General'), breadcrumb: 'General', routeParamBreadcrumb: false },
              resolve: {
                groupAccountsData: GroupAccountsResolver,
                groupSummary: GroupSummaryResolver
              }
            },
            {
              path: 'notes',
              component: NotesTabComponent,
              data: { title: extract('Notes'), breadcrumb: 'Notes', routeParamBreadcrumb: false },
              resolve: {
                groupNotes: GroupNotesResolver
              }
            },
            {
              path: 'committee',
              component: CommitteeTabComponent,
              data: { title: extract('Committee'), breadcrumb: 'Committee', routeParamBreadcrumb: false }
            },
            {
              path: 'datatables',
              children: [
                {
                  path: ':datatableName',
                  component: DatatableTabsComponent,
                  data: { title: extract('View Data Table'), routeParamBreadcrumb: 'datatableName' },
                  resolve: {
                    groupDatatable: GroupDatatableResolver
                  }
                }
              ]
            }
          ]
        }
      ]
    }
  ])
];

/**
 * Groups Routing Module
 *
 * Configures the groups routes.
 */
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [GroupViewResolver,
              GroupAccountsResolver,
              GroupSummaryResolver,
              GroupNotesResolver,
              GroupDatatablesResolver,
              GroupDatatableResolver]
})
export class GroupsRoutingModule { }
