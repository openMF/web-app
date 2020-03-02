import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/** Routing Imports */
import { Route } from '../core/route/route.service';

/** Translation Imports */
import { extract } from '../core/i18n/i18n.service';

/** Custom Components */
import { GroupsComponent } from './groups.component';

/** Custom Resolvers */
import { GroupsResolver } from './common-resolvers/groups.resolver';

const routes: Routes = [
  Route.withShell([

    {
      path: 'groups',
      component: GroupsComponent,
      data: { title: extract('Groups'), breadcrumb: 'Groups' },
      resolve: {
        groupsData: GroupsResolver,
      }
    }

  ])
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [
  GroupsResolver
  ]
})
export class GroupsRoutingModule { }
