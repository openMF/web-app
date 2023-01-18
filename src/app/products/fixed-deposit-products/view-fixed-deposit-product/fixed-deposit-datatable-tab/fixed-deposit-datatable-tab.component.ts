import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'mifosx-fixed-deposit-datatable-tab',
  templateUrl: './fixed-deposit-datatable-tab.component.html',
  styleUrls: ['./fixed-deposit-datatable-tab.component.scss']
})
export class FixedDepositDatatableTabComponent implements OnInit {
  entityId: string;
  entityDatatable: any;
  multiRowDatatableFlag: boolean;

  constructor(private route: ActivatedRoute) {
    this.entityId = this.route.parent.parent.snapshot.paramMap.get('productId');

    this.route.data.subscribe((data: { fixedDepositDatatable: any }) => {
      this.entityDatatable = data.fixedDepositDatatable;
      this.multiRowDatatableFlag = this.entityDatatable.columnHeaders[0].columnName === 'id' ? true : false;
    });
  }

  ngOnInit(): void {
  }

}
