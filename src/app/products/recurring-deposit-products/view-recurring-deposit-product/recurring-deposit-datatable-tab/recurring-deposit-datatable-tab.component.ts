import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'mifosx-recurring-deposit-datatable-tab',
  templateUrl: './recurring-deposit-datatable-tab.component.html',
  styleUrls: ['./recurring-deposit-datatable-tab.component.scss']
})
export class RecurringDepositDatatableTabComponent implements OnInit {

  entityId: string;
  entityDatatable: any;
  multiRowDatatableFlag: boolean;

  constructor(private route: ActivatedRoute) {
    this.entityId = this.route.parent.parent.snapshot.paramMap.get('productId');

    this.route.data.subscribe((data: { recurringDepositDatatable: any }) => {
      this.entityDatatable = data.recurringDepositDatatable;
      this.multiRowDatatableFlag = this.entityDatatable.columnHeaders[0].columnName === 'id' ? true : false;
    });
  }

  ngOnInit(): void {
  }

}
