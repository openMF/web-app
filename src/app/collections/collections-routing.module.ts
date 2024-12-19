import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/** Routing Imports */
import { Route } from '../core/route/route.service';

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
          data: {
            title: 'Individual Collection Sheet',
            breadcrumb: 'Individual Collection Sheet',
            routeParamBreadcrumb: false
          },
          component: IndividualCollectionSheetComponent,
          resolve: {
            officesData: OfficesResolver
          }
        }
      ]
    }
  ])

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  providers: [],
  exports: [RouterModule]
})
export class CollectionsRoutingModule {}
