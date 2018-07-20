import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { CoreModule } from '../core/core.module';
import { AccountingComponent } from './accounting.component';
import { AccountingRoutingModule } from './accounting-routing.module';
import { FrequentPostingsComponent } from './frequent-postings/frequent-postings.component';

@NgModule({
  imports: [
    CoreModule,
    CommonModule,
    ReactiveFormsModule,
    AccountingRoutingModule
  ],
  declarations: [AccountingComponent, FrequentPostingsComponent]
})
export class AccountingModule { }
