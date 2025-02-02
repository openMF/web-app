/** Angular Imports */
import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';

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
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
    NO_ERRORS_SCHEMA
  ],
  declarations: [
    IndividualCollectionSheetComponent
  ]
})
export class CollectionsModule {}
