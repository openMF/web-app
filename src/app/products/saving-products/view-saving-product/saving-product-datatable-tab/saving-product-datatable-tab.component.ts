import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'mifosx-saving-product-datatable-tab',
  templateUrl: './saving-product-datatable-tab.component.html',
  styleUrls: ['./saving-product-datatable-tab.component.scss']
})
export class SavingProductDatatableTabComponent {
  entityId: string;
  entityDatatable: any;
  multiRowDatatableFlag: boolean;

  constructor(private route: ActivatedRoute) {
    this.entityId = this.route.parent.parent.snapshot.paramMap.get('productId');

    this.route.data.subscribe((data: { savingProductDatatable: any }) => {
      this.entityDatatable = data.savingProductDatatable;
      this.multiRowDatatableFlag = this.entityDatatable.columnHeaders[0].columnName === 'id' ? true : false;
    });
  }
}
