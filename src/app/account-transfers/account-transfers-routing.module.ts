/** Angular Imports */
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/** Translation Imports */
import { extract } from '../core/i18n/i18n.service';

/** Custom Components */
import { ViewStandingInstructionsComponent } from './view-standing-instructions/view-standing-instructions.component';
import { EditStandingInstructionsComponent } from './edit-standing-instructions/edit-standing-instructions.component';

/** Custom Resolvers */
import { ViewStandingInstructionsResolver } from './common-resolvers/view-standing-instructions.resolver';
import { StandingInstructionsDataAndTemplateResolver } from './common-resolvers/standing-instructions-data-and-template.resolver';

/** Loans Route. */
const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: ':standingInstructionsId',
        data: { title: extract('Standing Instructions'), routeParamBreadcrumb: 'standingInstructionsId' },
        children: [
          {
            path: 'view',
            data: { title: extract('View Standing Instructions'), breadcrumb: 'view', routeParamBreadcrumb: false },
            component: ViewStandingInstructionsComponent,
            resolve: {
              standingInstructionsData: ViewStandingInstructionsResolver,
            },
          },
          {
            path: 'edit',
            data: { title: extract('Edit Standing Instructions'), breadcrumb: 'edit', routeParamBreadcrumb: false },
            component: EditStandingInstructionsComponent,
            resolve: {
              standingInstructionsDataAndTemplate: StandingInstructionsDataAndTemplateResolver,
            },
          }
        ]
      }]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  declarations: [],
  providers: [
    ViewStandingInstructionsResolver,
    StandingInstructionsDataAndTemplateResolver
  ]
})

export class AccountTransfersRoutingModule { }
