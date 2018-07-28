import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpModule } from '@angular/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CoreModule } from '../core/core.module';
import { MatTableModule } from '@angular/material/table';
import { FlexLayoutModule } from '@angular/flex-layout';

import { CentersComponent } from './centers.component';
import { CentersRoutingModule } from 'app/centers/centers-routing.module';
import { CentersService } from './centers.service';

@NgModule({
  imports: [
    CoreModule,
    CommonModule,
    CentersRoutingModule,
    FormsModule,
    MatTableModule,
    FlexLayoutModule

  ],
  declarations: [CentersComponent],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class CentersModule { }
