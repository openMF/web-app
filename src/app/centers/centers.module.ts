/** Angular imports */
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpModule } from '@angular/http';
/** Custom components */
import { CoreModule } from '../core/core.module';
import { SharedModule } from 'app/shared/shared.module';
import { CentersComponent } from './centers.component';
import { CentersRoutingModule } from 'app/centers/centers-routing.module';
import { CentersService } from './centers.service';
import { IndividualCollectionSheetComponent } from './individual-collection-sheet/individual-collection-sheet.component';
import { CollectionSheetComponent } from './collection-sheet/collection-sheet.component';

@NgModule({
  imports: [
    CoreModule,
    CommonModule,
    CentersRoutingModule,
    SharedModule,

  ],
  declarations: [CentersComponent, IndividualCollectionSheetComponent, CollectionSheetComponent],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class CentersModule { }
