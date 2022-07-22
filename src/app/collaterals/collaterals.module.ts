/** Angular Imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DirectivesModule } from '../directives/directives.module';

/** Custom Modules */
import { SharedModule } from 'app/shared/shared.module';
import { PipesModule } from '../pipes/pipes.module';

/** Custom Components */
import { CollateralsRoutingModule } from './collaterals-routing.module';
import { ViewCollateralComponent } from './view-collateral/view-collateral.component';
import { EditCollateralComponent } from './edit-collateral/edit-collateral.component';


@NgModule({
  declarations: [
    ViewCollateralComponent,
    EditCollateralComponent
  ],
  imports: [
    CommonModule,
    CollateralsRoutingModule,
    SharedModule,
    DirectivesModule,
    PipesModule
  ]
})
export class CollateralsModule { }
