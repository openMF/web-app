import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
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
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
    NO_ERRORS_SCHEMA
  ],
  exports: [RouterModule]
})
export class CollectionsRoutingModule {}
