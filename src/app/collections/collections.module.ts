/** Angular Imports */
import { NgModule } from '@angular/core';

/** Custom Modules */
import { SharedModule } from '../shared/shared.module';
import { PipesModule } from '../pipes/pipes.module';
import { CollectionsRoutingModule } from './collections-routing.module';

/** Custom Components */
import { IndividualCollectionSheetComponent } from './individual-collection-sheet/individual-collection-sheet.component';

@NgModule({
  imports: [
    SharedModule,
    PipesModule,
    CollectionsRoutingModule
  ],
  declarations: [
    IndividualCollectionSheetComponent
  ]
})
export class CollectionsModule { }
