/** Angular Imports */
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

/**
 * Offices Datatable Tabs Component
 */
@Component({
  selector: 'mifosx-datatable-tabs',
  templateUrl: './datatable-tabs.component.html',
  styleUrls: ['./datatable-tabs.component.scss']
})
export class DatatableTabsComponent {
  entityId: string;
  /** Office Datatable */
  entityDatatable: any;
  /** Multi Row Datatable Flag */
  multiRowDatatableFlag: boolean;

  /**
   * Fetches data table data from `resolve`
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute) {
    this.entityId = this.route.parent.parent.snapshot.paramMap.get('officeId');

    this.route.data.subscribe((data: { officeDatatable: any }) => {
      this.entityDatatable = data.officeDatatable;
      this.multiRowDatatableFlag = this.entityDatatable.columnHeaders[0].columnName === 'id' ? true : false;
    });
  }

}
