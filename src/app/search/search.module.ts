/** Angular Imports */
import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';

/** Custom Modules */
import { SharedModule } from '../shared/shared.module';
import { SearchRoutingModule } from './search-routing.module';

/** Custom Components */
import { SearchPageComponent } from './search-page/search-page.component';
import { PipesModule } from 'app/pipes/pipes.module';

/**
 * Search Module
 */
@NgModule({
  declarations: [SearchPageComponent],
  imports: [
    SharedModule,
    PipesModule,
    SearchRoutingModule
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
    NO_ERRORS_SCHEMA
  ]
})
export class SearchModule {}
