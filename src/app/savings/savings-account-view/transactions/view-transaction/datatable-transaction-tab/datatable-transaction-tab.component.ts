import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'mifosx-datatable-transaction-tab',
  templateUrl: './datatable-transaction-tab.component.html',
  styleUrls: ['./datatable-transaction-tab.component.scss']
})

export class DatatableTransactionTabComponent implements OnInit {
  entityId: string;
  /** Savings Datatable */
  entityDatatable: any;
  /** Multi Row Datatable Flag */
  multiRowDatatableFlag: boolean;
  constructor(private route: ActivatedRoute) {
    this.entityId = this.route.parent.parent.snapshot.paramMap.get('id');
    this.route.data.subscribe((data: { transactionDatatable:any }) => {
      this.entityDatatable = data.transactionDatatable;
      this.multiRowDatatableFlag = this.entityDatatable.columnHeaders[0].columnName === 'id' ? true : false;
    });
   }

  ngOnInit(): void {
  }

}