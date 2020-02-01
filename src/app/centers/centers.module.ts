/** Angular Imports */
import { NgModule } from '@angular/core';

/** Custom Modules */
import { CentersRoutingModule } from './centers-routing.module';
import { SharedModule } from 'app/shared/shared.module';
import { PipesModule } from '../pipes/pipes.module';

/** Custom Components */
import { CentersComponent } from './centers.component';
import { CreateCenterComponent } from './create-center/create-center.component';

/**
 * Centers Module
 *
 * All components related to Centers should be declared here.
 */
@NgModule({
  imports: [
    SharedModule,
    CentersRoutingModule,
    PipesModule
  ],
  declarations: [
    CentersComponent,
    CreateCenterComponent
  ]
})
export class CentersModule { }
