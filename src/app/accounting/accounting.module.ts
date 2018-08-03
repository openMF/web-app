import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

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
import { CreateFinancialActivityMappingComponent } from './financial-activity-mappings/create-financial-activity-mapping/create-financial-activity-mapping.component';
import { ViewFinancialActivityMappingComponent } from './financial-activity-mappings/view-financial-activity-mapping/view-financial-activity-mapping.component';
import { EditFinancialActivityMappingComponent } from './financial-activity-mappings/edit-financial-activity-mapping/edit-financial-activity-mapping.component';
import { ChartOfAccountsComponent } from './chart-of-accounts/chart-of-accounts.component';
import { CreateGlAccountComponent } from './chart-of-accounts/create-gl-account/create-gl-account.component';
import { ViewGlAccountComponent } from './chart-of-accounts/view-gl-account/view-gl-account.component';
import { EditGlAccountComponent } from './chart-of-accounts/edit-gl-account/edit-gl-account.component';

@NgModule({
  imports: [
    CoreModule,
    CommonModule,
    FormsModule,
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
    FinancialActivityMappingsComponent,
    CreateFinancialActivityMappingComponent,
    ViewFinancialActivityMappingComponent,
    EditFinancialActivityMappingComponent,
    ChartOfAccountsComponent,
    CreateGlAccountComponent,
    ViewGlAccountComponent,
    EditGlAccountComponent
  ],
  entryComponents: [
    RevertTransactionComponent,
    ViewJournalEntryComponent
  ]
})
export class AccountingModule { }
