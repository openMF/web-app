import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EntityDatatableTabComponent } from '../../../../shared/tabs/entity-datatable-tab/entity-datatable-tab.component';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-fixed-deposit-datatable-tab',
  templateUrl: './fixed-deposit-datatable-tab.component.html',
  styleUrls: ['./fixed-deposit-datatable-tab.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    EntityDatatableTabComponent
  ]
})
export class FixedDepositDatatableTabComponent {
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
}
