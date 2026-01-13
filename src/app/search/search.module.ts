/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

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
  imports: [
    SharedModule,
    PipesModule,
    SearchRoutingModule,
    SearchPageComponent
  ]
})
export class SearchModule {}
