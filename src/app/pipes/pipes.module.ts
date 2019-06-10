import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatusLookupPipe } from './status-lookup.pipe';
import { AccountsFilterPipe } from './accounts-filter.pipe';



@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [StatusLookupPipe, AccountsFilterPipe],
  providers: [StatusLookupPipe, AccountsFilterPipe],
  exports: [StatusLookupPipe, AccountsFilterPipe]
})
export class PipesModule { }
