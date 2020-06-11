/** Angular Imports */
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

/**
 * Savings Datatable Tabs Component
 */
@Component({
  selector: 'mifosx-datatable-tabs',
  templateUrl: './datatable-tabs.component.html',
  styleUrls: ['./datatable-tabs.component.scss']
})
export class DatatableTabsComponent {

  /** Savings Datatable */
  savingsDatatable: any;
  /** Multi Row Datatable Flag */
  multiRowDatatableFlag: boolean;

  /**
   * Fetches Savings and datatables data from `resolve`
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe((data: { savingsDatatable: any }) => {
      this.savingsDatatable = data.savingsDatatable;
      this.multiRowDatatableFlag = this.savingsDatatable.columnHeaders[0].columnName === 'id' ? true : false;
    });
  }

}
