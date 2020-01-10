/** Angular Imports */
import { NgModule } from '@angular/core';

/** Custom Modules */
import { SharedModule } from '../shared/shared.module';
import { BulkImportRoutingModule } from './bulk-import-routing.module';

/** Custom Components */
import { BulkImportComponent } from './bulk-import.component';

/**
 * Bulk Import Module
 *
 * All components related to bulk import functions should be declared here.
 */
@NgModule({
  imports: [
    SharedModule,
    BulkImportRoutingModule
  ],
  declarations: [
    BulkImportComponent
  ]
})
export class BulkImportModule { }
