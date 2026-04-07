import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EntityDatatableTabComponent } from '../../../../shared/tabs/entity-datatable-tab/entity-datatable-tab.component';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-recurring-deposit-datatable-tab',
  templateUrl: './recurring-deposit-datatable-tab.component.html',
  styleUrls: ['./recurring-deposit-datatable-tab.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    EntityDatatableTabComponent
  ]
})
export class RecurringDepositDatatableTabComponent {
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
}
