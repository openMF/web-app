import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/** Routing Imports */
import { Route } from '../core/route/route.service';

/** Translation Imports */
import { extract } from '../core/i18n/i18n.service';

/** Custom Components */
import { IndividualCollectionSheetComponent } from './individual-collection-sheet/individual-collection-sheet.component';
import { OfficesResolver } from 'app/organization/offices/common-resolvers/offices.resolver';

const routes: Routes = [
  Route.withShell([
    {
      path: 'collections',
      children: [
        {
          path: 'individual-collection-sheet',
          data: { title: extract('Individual Collection Sheet'), breadcrumb: 'Individual Collection Sheet', routeParamBreadcrumb: false },
          component: IndividualCollectionSheetComponent,
          resolve: {
            officesData: OfficesResolver
          }
        },
      ]
    }
  ])
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  providers: [],
  exports: [RouterModule]
})
export class CollectionsRoutingModule { }
