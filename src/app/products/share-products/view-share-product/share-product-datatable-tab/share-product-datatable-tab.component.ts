import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'mifosx-share-product-datatable-tab',
  templateUrl: './share-product-datatable-tab.component.html',
  styleUrls: ['./share-product-datatable-tab.component.scss']
})
export class ShareProductDatatableTabComponent implements OnInit {

  entityId: string;
  entityDatatable: any;
  multiRowDatatableFlag: boolean;

  constructor(private route: ActivatedRoute) {
    this.entityId = this.route.parent.parent.snapshot.paramMap.get('productId');

    this.route.data.subscribe((data: { shareProductDatatable: any }) => {
      this.entityDatatable = data.shareProductDatatable;
      this.multiRowDatatableFlag = this.entityDatatable.columnHeaders[0].columnName === 'id' ? true : false;
    });
  }

  ngOnInit(): void {
  }

}
