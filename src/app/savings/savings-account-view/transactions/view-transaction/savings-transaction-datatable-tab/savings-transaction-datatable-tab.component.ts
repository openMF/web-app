import { Component } from '@angular/core';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-savings-transaction-datatable-tab',
  templateUrl: './savings-transaction-datatable-tab.component.html',
  styleUrls: ['./savings-transaction-datatable-tab.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS
  ]
})
export class SavingsTransactionDatatableTabComponent {
  constructor() {}
}
