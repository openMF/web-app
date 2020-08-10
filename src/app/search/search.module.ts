/** Angular Imports */
import { NgModule } from '@angular/core';

/** Custom Modules */
import { SharedModule } from '../shared/shared.module';
import { SearchRoutingModule } from './search-routing.module';

/** Custom Components */
import { SearchToolComponent } from './search-tool/search-tool.component';
import { SearchPageComponent } from './search-page/search-page.component';

/**
 * Search Module
 */
@NgModule({
  declarations: [SearchToolComponent, SearchPageComponent],
  imports: [
    SharedModule,
    SearchRoutingModule
  ],
  exports: [
    SearchToolComponent
  ]
})
export class SearchModule { }
