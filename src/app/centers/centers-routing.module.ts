import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/** Routing Imports */
import { Route } from '../core/route/route.service';

/** Translation Imports */
import { extract } from '../core/i18n/i18n.service';

/** Custom component imports */
import { CentersComponent } from './centers.component';
import { IndividualCollectionSheetComponent } from './individual-collection-sheet/individual-collection-sheet.component';
import { CollectionSheetComponent } from './collection-sheet/collection-sheet.component';

const routes: Routes = [
  Route.withShell([

    {
      path: 'centers',
      component: CentersComponent,
      data: { title: extract('Centers'),  breadcrumb: 'Centers' }
    },
    {
      path: 'centers/individual-collection-sheet',
      component: IndividualCollectionSheetComponent,
      data: { title: extract('Individual Collection Sheet'),  breadcrumb: 'Individual Collection Sheet' }
    },
    {
      path: 'centers/individual-collection-sheet/collection-sheet',
      component: CollectionSheetComponent,
      data: { title: extract('Collection Sheet'),  breadcrumb: 'Collection Sheet' }
    }
  ])
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class CentersRoutingModule { }
