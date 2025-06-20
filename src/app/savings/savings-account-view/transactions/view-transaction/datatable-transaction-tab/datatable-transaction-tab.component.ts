import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EntityDatatableTabComponent } from '../../../../../shared/tabs/entity-datatable-tab/entity-datatable-tab.component';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-datatable-transaction-tab',
  templateUrl: './datatable-transaction-tab.component.html',
  styleUrls: ['./datatable-transaction-tab.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    EntityDatatableTabComponent
  ]
})
export class DatatableTransactionTabComponent {
  /** Transaction Id */
  entityId: string;
  /** Savings Datatable */
  entityDatatable: any;
  /** Multi Row Datatable Flag */
  multiRowDatatableFlag: boolean;
  constructor(private route: ActivatedRoute) {
    this.entityId = this.route.parent.parent.snapshot.paramMap.get('id');
    this.route.data.subscribe((data: { transactionDatatable: any }) => {
      this.entityDatatable = data.transactionDatatable;
      this.multiRowDatatableFlag = this.entityDatatable.columnHeaders[0].columnName === 'id' ? true : false;
    });
  }
}
