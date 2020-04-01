/** Angular imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

/** Custom Modules */
import { SharedModule } from '../shared/shared.module';
import { SavingsRoutingModule} from './savings-routing.module';

/** Custom components */
import {SavingsApplicationComponent} from './savings-application/savings-application.component';
import {SavingsComponent} from './savings.component';

@NgModule({
  declarations: [SavingsApplicationComponent, SavingsComponent],
  imports: [
    CommonModule,
    SharedModule,
    SavingsRoutingModule
  ]
})
export class SavingsModule { }
