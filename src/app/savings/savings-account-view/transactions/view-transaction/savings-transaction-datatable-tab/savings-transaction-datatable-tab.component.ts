import { Component } from '@angular/core';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';

@Component({
  selector: 'mifosx-savings-transaction-datatable-tab',
  templateUrl: './savings-transaction-datatable-tab.component.html',
  styleUrls: ['./savings-transaction-datatable-tab.component.scss'],
  imports: [
    TranslatePipe,
    NgxTranslatePipe
  ]
})
export class SavingsTransactionDatatableTabComponent {
  constructor() {}
}
