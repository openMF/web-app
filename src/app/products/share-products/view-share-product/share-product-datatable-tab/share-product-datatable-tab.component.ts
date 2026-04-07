import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EntityDatatableTabComponent } from '../../../../shared/tabs/entity-datatable-tab/entity-datatable-tab.component';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-share-product-datatable-tab',
  templateUrl: './share-product-datatable-tab.component.html',
  styleUrls: ['./share-product-datatable-tab.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    EntityDatatableTabComponent
  ]
})
export class ShareProductDatatableTabComponent {
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
}
