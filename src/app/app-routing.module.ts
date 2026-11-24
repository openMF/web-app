/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Not Found Component
import { NotFoundComponent } from './not-found/not-found.component';
import { CallbackComponent } from './zitadel/callback/callback.component';
import { UnconfiguredHostComponent } from './unconfigured-host/unconfigured-host.component';
import { unmappedHostGuard } from './unconfigured-host/unmapped-host.guard';
import { Route } from './core/route/route.service';

/**
 * App routing module.
 *
 * Registers all feature modules as lazy-loaded routes plus the fallback routes.
 */
const routes: Routes = [
  {
    path: 'login',
    // Opt-in (window.env.blockUnmappedHosts): refuse to sign in on a host mapped to no cooperative.
    canActivate: [unmappedHostGuard],
    loadChildren: () => import('./login/login.module').then((m) => m.LoginModule)
  },
  {
    path: 'unconfigured-host',
    component: UnconfiguredHostComponent
  },
  {
    path: 'coop',
    loadChildren: () => import('./coop/coop.module').then((m) => m.CoopModule)
  },
  {
    path: 'accounting',
    loadChildren: () => import('./accounting/accounting.module').then((m) => m.AccountingModule)
  },
  {
    path: 'centers',
    loadChildren: () => import('./centers/centers.module').then((m) => m.CentersModule)
  },
  {
    path: 'members',
    loadChildren: () => import('./clients/clients.module').then((m) => m.ClientsModule)
  },
  {
    path: 'collections',
    loadChildren: () => import('./collections/collections.module').then((m) => m.CollectionsModule)
  },
  {
    path: 'groups',
    loadChildren: () => import('./groups/groups.module').then((m) => m.GroupsModule)
  },
  {
    path: 'navigation',
    loadChildren: () => import('./navigation/navigation.module').then((m) => m.NavigationModule)
  },
  {
    path: 'notifications',
    loadChildren: () => import('./notifications/notifications.module').then((m) => m.NotificationsModule)
  },
  {
    path: 'organization',
    loadChildren: () => import('./organization/organization.module').then((m) => m.OrganizationModule)
  },
  {
    path: 'products',
    loadChildren: () => import('./products/products.module').then((m) => m.ProductsModule)
  },
  {
    path: 'profile',
    loadChildren: () => import('./profile/profile.module').then((m) => m.ProfileModule)
  },
  {
    path: 'remittances',
    loadChildren: () => import('./remittances/remittances.module').then((m) => m.RemittancesModule)
  },
  {
    path: 'reports',
    loadChildren: () => import('./reports/reports.module').then((m) => m.ReportsModule)
  },
  {
    path: 'search',
    loadChildren: () => import('./search/search.module').then((m) => m.SearchModule)
  },
  {
    path: 'settings',
    loadChildren: () => import('./settings/settings.module').then((m) => m.SettingsModule)
  },
  {
    path: 'system',
    loadChildren: () => import('./system/system.module').then((m) => m.SystemModule)
  },
  {
    path: 'checker-inbox-and-tasks',
    loadChildren: () => import('./tasks/tasks.module').then((m) => m.TasksModule)
  },
  {
    path: 'templates',
    loadChildren: () => import('./templates/templates.module').then((m) => m.TemplatesModule)
  },
  {
    path: 'appusers',
    loadChildren: () => import('./users/users.module').then((m) => m.UsersModule)
  },
  {
    // Public loan calculator (fineract-dbug #242): no sign-in and no side menu, so it sits outside the shell.
    path: 'calculator',
    loadComponent: () =>
      import('./loans/public-loan-calculator/public-loan-calculator.component').then(
        (m) => m.PublicLoanCalculatorComponent
      )
  },
  Route.withShell([
    {
      path: 'loan-calculator',
      loadComponent: () =>
        import('./loans/loan-calculator/loan-calculator.component').then((m) => m.LoanCalculatorComponent),
      data: { title: 'Loan Calculator', breadcrumb: 'Loan Calculator' }
    },
    {
      // Our own lending module (fineract-dbug ADR-0061): its routes live in src/app/lending.
      path: 'lending',
      data: { title: 'Lending' },
      loadChildren: () => import('./lending/lending.routes').then((m) => m.LENDING_ROUTES)
      path: 'quick-deposit',
      loadComponent: () =>
        import('./savings/quick-transaction/quick-transaction.component').then((m) => m.QuickTransactionComponent),
      data: { title: 'Quick Deposit', breadcrumb: 'Quick Deposit', command: 'Deposit' }
    },
    {
      path: 'quick-withdraw',
      loadComponent: () =>
        import('./savings/quick-transaction/quick-transaction.component').then((m) => m.QuickTransactionComponent),
      data: { title: 'Quick Withdraw', breadcrumb: 'Quick Withdraw', command: 'Withdrawal' }
    },
    {
      path: 'compliance',
      data: { title: 'Compliance', breadcrumb: 'Compliance' },
      children: [
        {
          path: '',
          loadComponent: () =>
            import('./compliance/compliance-home/compliance-home.component').then((m) => m.ComplianceHomeComponent)
        },
        {
          path: 'threshold-reports',
          loadComponent: () =>
            import('./compliance/threshold-reports/threshold-reports.component').then(
              (m) => m.ThresholdReportsComponent
            ),
          data: { title: 'Threshold reports', breadcrumb: 'Threshold reports' }
        },
        {
          path: 'risk',
          loadComponent: () =>
            import('./compliance/risk/risk-list/risk-list.component').then((m) => m.RiskListComponent),
          data: { title: 'Member risk', breadcrumb: 'Member risk' }
        },
        {
          path: 'members/:clientId',
          loadComponent: () =>
            import('./compliance/risk/member-risk/member-risk.component').then((m) => m.MemberRiskComponent),
          data: { title: 'Compliance profile', breadcrumb: 'Compliance profile', routeParamBreadcrumb: false }
        },
        {
          path: 'peps',
          loadComponent: () =>
            import('./compliance/pep/pep-register/pep-register.component').then((m) => m.PepRegisterComponent),
          data: { title: 'Politically exposed persons', breadcrumb: 'Politically exposed persons' }
        },
        {
          path: 'peps/:id',
          loadComponent: () =>
            import('./compliance/pep/pep-detail/pep-detail.component').then((m) => m.PepDetailComponent),
          data: {
            title: 'Politically exposed person',
            breadcrumb: 'Politically exposed person',
            routeParamBreadcrumb: false
          }
        },
        {
          path: 'alerts',
          loadComponent: () =>
            import('./compliance/cases/alert-list/alert-list.component').then((m) => m.AlertListComponent),
          data: { title: 'Alerts', breadcrumb: 'Alerts' }
        },
        {
          path: 'alerts/:id',
          loadComponent: () =>
            import('./compliance/cases/alert-detail/alert-detail.component').then((m) => m.AlertDetailComponent),
          data: { title: 'Alert', breadcrumb: 'Alert', routeParamBreadcrumb: false }
        },
        {
          path: 'cases',
          loadComponent: () =>
            import('./compliance/cases/case-list/case-list.component').then((m) => m.CaseListComponent),
          data: { title: 'Cases', breadcrumb: 'Cases' }
        },
        {
          path: 'cases/:id',
          loadComponent: () =>
            import('./compliance/cases/case-detail/case-detail.component').then((m) => m.CaseDetailComponent),
          data: { title: 'Case', breadcrumb: 'Case', routeParamBreadcrumb: false }
        },
        {
          path: 'screening',
          loadComponent: () =>
            import('./compliance/screening/screening-home/screening-home.component').then(
              (m) => m.ScreeningHomeComponent
            ),
          data: { title: 'Screening', breadcrumb: 'Screening' }
        },
        {
          path: 'screening/matches/:id',
          loadComponent: () =>
            import('./compliance/screening/match-review/match-review.component').then((m) => m.MatchReviewComponent),
          data: { title: 'Possible match', breadcrumb: 'Possible match', routeParamBreadcrumb: false }
        },
        {
          path: 'screening/freezes',
          loadComponent: () =>
            import('./compliance/screening/freezes/freezes.component').then((m) => m.FreezesComponent),
          data: { title: 'Funds held', breadcrumb: 'Funds held' }
        },
        {
          path: 'screening/freezes/:id',
          loadComponent: () =>
            import('./compliance/screening/freeze-detail/freeze-detail.component').then((m) => m.FreezeDetailComponent),
          data: { title: 'Funds held', breadcrumb: 'Funds held', routeParamBreadcrumb: false }
        },
        {
          path: 'reports',
          loadComponent: () =>
            import('./compliance/governance/reports-home/reports-home.component').then((m) => m.ReportsHomeComponent),
          data: { title: 'Yearly reports', breadcrumb: 'Yearly reports' }
        },
        {
          path: 'reports/:type/:fiscalYear',
          loadComponent: () =>
            import('./compliance/governance/report-view/report-view.component').then((m) => m.ReportViewComponent),
          data: { title: 'Yearly report', breadcrumb: 'Yearly report', routeParamBreadcrumb: false }
        },
        {
          path: 'governance',
          loadComponent: () =>
            import('./compliance/governance/governance-page/governance-page.component').then(
              (m) => m.GovernancePageComponent
            ),
          data: { title: 'Governance', breadcrumb: 'Governance' }
        },
        {
          // Elections (fineract-dbug #144): the board's and the accounts supervision committee's elections, next
          // to the Compliance > Governance (AML) page above, per the backend's own placement for this feature.
          path: 'governance/elections',
          loadComponent: () =>
            import('./compliance/governance/elections/elections-list/elections-list.component').then(
              (m) => m.ElectionsListComponent
            ),
          data: { title: 'Elections', breadcrumb: 'Elections' }
        },
        {
          path: 'governance/elections/:id',
          loadComponent: () =>
            import('./compliance/governance/elections/election-detail/election-detail.component').then(
              (m) => m.ElectionDetailComponent
            ),
          data: {
            title: 'Election',
            breadcrumb: 'Election',
            routeParamBreadcrumb: false,
            parentBreadcrumb: { label: 'Elections', url: '/compliance/governance/elections' }
          }
        },
        {
          path: 'governance/blacklist',
          loadComponent: () =>
            import('./compliance/governance/standing/blacklist/blacklist.component').then((m) => m.BlacklistComponent),
          data: {
            title: 'Blacklist',
            breadcrumb: 'Blacklist',
            parentBreadcrumb: { label: 'Elections', url: '/compliance/governance/elections' }
          }
        },
        {
          path: 'governance/staff',
          loadComponent: () =>
            import('./compliance/governance/standing/staff/staff.component').then((m) => m.StaffComponent),
          data: {
            title: 'Staff and members',
            breadcrumb: 'Staff and members',
            parentBreadcrumb: { label: 'Elections', url: '/compliance/governance/elections' }
          }
        },
        {
          path: 'risk-tables',
          loadComponent: () =>
            import('./compliance/pep/risk-tables/risk-tables.component').then((m) => m.RiskTablesComponent),
          data: { title: 'Occupation and area grades', breadcrumb: 'Occupation and area grades' }
        }
      ]
    },
    {
      // The governance register (fineract-dbug #138): kept apart from the AML-focused Compliance > Governance
      // screen above. A person's own page (people/:id) is a sibling, not nested under the tab shell, same as
      // Compliance's peps/:id.
      path: 'governance-register',
      data: { title: 'Governance register', breadcrumb: 'Governance register' },
      children: [
        {
          path: '',
          loadComponent: () =>
            import('./governance-register/governance-register-shell.component').then(
              (m) => m.GovernanceRegisterShellComponent
            ),
          children: [
            { path: '', redirectTo: 'committees', pathMatch: 'full' },
            {
              path: 'committees',
              loadComponent: () =>
                import('./governance-register/committees/committees.component').then((m) => m.CommitteesComponent),
              data: { title: 'Committees', breadcrumb: 'Committees' }
            },
            {
              path: 'people',
              loadComponent: () =>
                import('./governance-register/people/people.component').then((m) => m.PeopleComponent),
              data: { title: 'People', breadcrumb: 'People' }
            },
            {
              path: 'directors',
              loadComponent: () =>
                import('./governance-register/directors-table/directors-table.component').then(
                  (m) => m.DirectorsTableComponent
                ),
              data: { title: "Directors' table", breadcrumb: "Directors' table" }
            },
            {
              path: 'property-declarations',
              loadComponent: () =>
                import('./governance-register/property-declarations/property-declarations.component').then(
                  (m) => m.PropertyDeclarationsComponent
                ),
              data: { title: 'Who has declared', breadcrumb: 'Who has declared' }
            },
            {
              path: 'related-parties',
              loadComponent: () =>
                import('./governance-register/related-parties/related-parties.component').then(
                  (m) => m.RelatedPartiesComponent
                ),
              data: { title: 'Related parties', breadcrumb: 'Related parties' }
            },
            {
              path: 'meetings',
              loadComponent: () =>
                import('./governance-register/meetings/meetings-list/meetings-list.component').then(
                  (m) => m.MeetingsListComponent
                ),
              data: { title: 'Meetings', breadcrumb: 'Meetings' }
            }
          ]
        },
        {
          path: 'meetings/:id',
          loadComponent: () =>
            import('./governance-register/meetings/meeting-detail/meeting-detail.component').then(
              (m) => m.MeetingDetailComponent
            ),
          // The default back link would go to the generic Governance register (its nearest route parent, since
          // this page is a sibling of the tab shell, not nested under it); pointed at Meetings instead, the way
          // person-detail points its own back link at People above.
          data: {
            title: 'Meeting',
            breadcrumb: 'Meeting',
            routeParamBreadcrumb: false,
            parentBreadcrumb: { label: 'Meetings', url: '/governance-register/meetings' }
          }
        },
        {
          path: 'people/:id',
          loadComponent: () =>
            import('./governance-register/people/person-detail/person-detail.component').then(
              (m) => m.PersonDetailComponent
            ),
          // The default back link would go to the generic Governance register (its nearest route parent, since
          // this page is a sibling of the tab shell, not nested under it); pointed at People instead, the way
          // loan-aging points its own back link at Reports above.
          data: {
            title: 'Person',
            breadcrumb: 'Person',
            routeParamBreadcrumb: false,
            parentBreadcrumb: { label: 'People', url: '/governance-register/people' }
          }
        }
      ]
    },
    {
      // The management report (fineract-dbug #142): a separate issue/permission set from the governance register
      // above, so its own top-level route rather than a tab inside governance-register-shell.
      path: 'management-reports',
      data: { title: 'Management reports', breadcrumb: 'Management reports' },
      children: [
        {
          path: '',
          loadComponent: () =>
            import('./management-reports/reports-list/reports-list.component').then((m) => m.ReportsListComponent)
        },
        {
          path: ':id',
          loadComponent: () =>
            import('./management-reports/report-detail/report-detail.component').then((m) => m.ReportDetailComponent),
          data: { title: 'Report', breadcrumb: 'Report', routeParamBreadcrumb: false }
        }
      ]
    },
    {
      path: 'loan-aging',
      loadComponent: () => import('./reports/loan-aging/loan-aging.component').then((m) => m.LoanAgingComponent),
      data: {
        title: 'Loan Aging',
        breadcrumb: 'Loan Aging',
        parentBreadcrumb: { label: 'Reports', url: '/reports-overview' }
      }
    }
  ]),
  {
    path: 'callback',
    component: CallbackComponent
  },
  {
    path: '**',
    component: NotFoundComponent
  }
];

/**
 * App Routing Module.
 *
 * Configures the top-level routes with lazy loading for all feature modules.
 */
@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
  providers: []
})
export class AppRoutingModule {}
