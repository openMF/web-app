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
import { AuditTabComponent } from './groups-view/audit-tab/audit-tab.component';
import { CreateGroupComponent } from './create-group/create-group.component';
import { DatatableTabsComponent } from './groups-view/datatable-tabs/datatable-tabs.component';
import { AddRoleComponent } from './groups-view/add-role/add-role.component';
import { GroupActionsComponent } from './groups-view/group-actions/group-actions.component';
import { EditGroupComponent } from './edit-group/edit-group.component';
import { GroupBulkClientRemovalComponent } from './group-bulk-client-removal/group-bulk-client-removal.component';

/** Custom Resolvers */
import { GroupViewResolver } from './common-resolvers/group-view.resolver';
import { GroupAccountsResolver } from './common-resolvers/group-account.resolver';
import { GroupSummaryResolver } from './common-resolvers/group-summary.resolver';
import { GroupNotesResolver } from './common-resolvers/group-notes.resolver';
import { OfficesResolver } from 'app/accounting/common-resolvers/offices.resolver';
import { GroupDatatablesResolver } from './common-resolvers/group-datatables.resolver';
import { GroupDatatableResolver } from './common-resolvers/group-datatable.resolver';
import { GroupDataAndTemplateResolver } from './common-resolvers/group-data-and-template.resolver';
import { GroupActionsResolver } from './common-resolvers/group-actions.resolver';
import { LowestOfficesResolver } from 'app/accounting/common-resolvers/lowest-offices.resolver';

/** Groups Routes */
const routes: Routes = [
  Route.withShell([
    {
      path: 'groups',
      data: { title: extract('labels.heading.Groups'), breadcrumb: 'Groups', routeParamBreadcrumb: false },
      children: [
        {
          path: '',
          component: GroupsComponent,
        },
        {
          path: 'create',
          component: CreateGroupComponent,
          data: { title: extract('labels.text.Create Group'), breadcrumb: 'Create', routeParamBreadcrumb: false },
          resolve: {
            offices: LowestOfficesResolver
          }
        },
        {
          path: 'bulk-client-removal',
          component: GroupBulkClientRemovalComponent,
          data: {
            title: extract('labels.oaf.Bulk Client Group Removal'),
            breadcrumb: 'Bulk Client Removal',
            routeParamBreadcrumb: false,
          },
        },
        {
          path: ':groupId',
          data: { title: extract('labels.text.View Group'), routeParamBreadcrumb: 'groupId' },
          resolve: {
            groupViewData: GroupViewResolver,
          },
          children: [
            {
              path: '',
              component: GroupsViewComponent,
              resolve: {
                groupViewData: GroupViewResolver,
                //groupDatatables: GroupDatatablesResolver
              },
              children: [
                {
                  path: 'general',
                  component: GeneralTabComponent,
                  data: {
                    title: extract('labels.heading.General'),
                    breadcrumb: 'General',
                    routeParamBreadcrumb: false,
                  },
                  resolve: {
                    groupAccountsData: GroupAccountsResolver,
                    groupSummary: GroupSummaryResolver,
                  },
                },
                {
                  path: 'notes',
                  component: NotesTabComponent,
                  data: { title: extract('labels.heading.Notes'), breadcrumb: 'Notes', routeParamBreadcrumb: false },
                  resolve: {
                    groupNotes: GroupNotesResolver,
                  },
                },
                {
                  path: 'committee',
                  component: CommitteeTabComponent,
                  data: {
                    title: extract('labels.text.Committee'),
                    breadcrumb: 'Committee',
                    routeParamBreadcrumb: false,
                  },
                },
                {
                  path: 'audit',
                  component: AuditTabComponent,
                  data: {
                    title: extract('labels.text.Audit'),
                    breadcrumb: 'Audit',
                    routeParamBreadcrumb: false,
                  },
                },
                {
                  path: 'datatables',
                  children: [
                    {
                      path: ':datatableName',
                      component: DatatableTabsComponent,
                      data: { title: extract('labels.text.View Data Table'), routeParamBreadcrumb: 'datatableName' },
                      resolve: {
                        groupDatatable: GroupDatatableResolver,
                      },
                    },
                  ],
                },
              ],
            },
            {
              path: 'edit',
              component: EditGroupComponent,
              data: { title: extract('labels.text.Edit Group'), breadcrumb: 'Edit', routeParamBreadcrumb: false },
              resolve: {
                groupAndTemplateData: GroupDataAndTemplateResolver,
                groupViewData: GroupViewResolver,
              },
            },
            {
              path: 'committee',
              children: [
                {
                  path: '',
                  redirectTo: '../committee',
                  pathMatch: 'prefix',
                },
                {
                  path: 'add-role',
                  data: { title: extract('labels.text.Add Role'), breadcrumb: 'Add Role', routeParamBreadcrumb: false },
                  component: AddRoleComponent,
                  resolve: {
                    groupAndTemplateData: GroupDataAndTemplateResolver,
                  },
                },
              ],
            },
            {
              path: 'actions/:name',
              data: { title: extract('labels.text.Group Actions'), routeParamBreadcrumb: 'name' },
              component: GroupActionsComponent,
              resolve: {
                groupActionData: GroupActionsResolver,
              },
            },
            {
              path: 'loans-accounts',
              loadChildren: () => import('../loans/loans.module').then((m) => m.LoansModule),
            },
            {
              path: 'savings-accounts',
              loadChildren: () => import('../savings/savings.module').then((m) => m.SavingsModule),
            },
          ],
        },
      ],
    },
  ]),
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
              GroupDatatableResolver,
              GroupDataAndTemplateResolver,
              GroupActionsResolver,
              LowestOfficesResolver
            ]
})
export class GroupsRoutingModule {}
