/** Angular Imports */
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

/**
 * Groups Datatable Tabs Component
 */
@Component({
  selector: 'mifosx-datatable-tabs',
  templateUrl: './datatable-tabs.component.html',
  styleUrls: ['./datatable-tabs.component.scss']
})
export class DatatableTabsComponent {

  /** Group Datatable */
  groupDatatable: any;
  /** Multi Row Datatable Flag */
  multiRowDatatableFlag: boolean;

  /**
   * Fetches data table data from `resolve`
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe((data: { groupDatatable: any }) => {
      this.groupDatatable = data.groupDatatable;
      this.multiRowDatatableFlag = this.groupDatatable.columnHeaders[0].columnName === 'id' ? true : false;
    });
  }

}
