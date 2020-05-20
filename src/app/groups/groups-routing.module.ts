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

/** Custom Resolvers */
import { GroupViewResolver } from './common-resolvers/group-view.resolver';
import { GroupAccountsResolver } from './common-resolvers/group-account.resolver';
import { GroupSummaryResolver } from './common-resolvers/group-summary.resolver';
import { GroupClientMembersResolver } from './common-resolvers/group-client-members.resolver';
import { GroupNotesResolver } from './common-resolvers/group-notes.resolver';

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
          path: ':groupId',
          component: GroupsViewComponent,
          data: { title: extract('View Group'), routeParamBreadcrumb: 'groupId' },
          resolve: {
            groupViewData: GroupViewResolver,

          },
          children: [
            {
              path: 'general',
              component: GeneralTabComponent,
              data: { title: extract('General'), breadcrumb: 'General', routeParamBreadcrumb: false },
              resolve: {
                groupAccountsData: GroupAccountsResolver,
                groupClientMembers: GroupClientMembersResolver,
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
              GroupClientMembersResolver,
              GroupNotesResolver]
})
export class GroupsRoutingModule { }
