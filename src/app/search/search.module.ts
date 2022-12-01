/** Angular Imports */
import { NgModule } from '@angular/core';

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
  ]
})
export class SearchModule { }
