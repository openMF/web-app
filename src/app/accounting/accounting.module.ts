import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CoreModule } from '../core/core.module';
import { AccountingComponent } from './accounting.component';
import { AccountingRoutingModule } from './accounting-routing.module';

@NgModule({
  imports: [
    CoreModule,
    CommonModule,
    AccountingRoutingModule
  ],
  declarations: [AccountingComponent]
})
export class AccountingModule { }
