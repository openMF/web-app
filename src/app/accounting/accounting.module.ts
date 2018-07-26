import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { CoreModule } from '../core/core.module';
import { AccountingComponent } from './accounting.component';
import { AccountingRoutingModule } from './accounting-routing.module';
import { FrequentPostingsComponent } from './frequent-postings/frequent-postings.component';
import { ViewTransactionComponent } from './view-transaction/view-transaction.component';
import { RevertTransactionComponent } from './revert-transaction/revert-transaction.component';
import { ViewJournalEntryComponent } from './view-journal-entry/view-journal-entry.component';
import { CreateJournalEntryComponent } from './create-journal-entry/create-journal-entry.component';
import { SearchJournalEntryComponent } from './search-journal-entry/search-journal-entry.component';
import { FinancialActivityMappingsComponent } from './financial-activity-mappings/financial-activity-mappings.component';

@NgModule({
  imports: [
    CoreModule,
    CommonModule,
    ReactiveFormsModule,
    AccountingRoutingModule
  ],
  declarations: [
    AccountingComponent,
    FrequentPostingsComponent,
    ViewTransactionComponent,
    RevertTransactionComponent,
    ViewJournalEntryComponent,
    CreateJournalEntryComponent,
    SearchJournalEntryComponent,
    FinancialActivityMappingsComponent
  ],
  entryComponents: [
    RevertTransactionComponent,
    ViewJournalEntryComponent
  ]
})
export class AccountingModule { }
