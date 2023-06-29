import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'mifosx-datatable-tab',
  templateUrl: './datatable-tab.component.html',
  styleUrls: ['./datatable-tab.component.scss']
})
export class DatatableTabComponent {

  entityId: string;
  /** Loan Datatable */
  entityDatatable: any = null;
  /** Multi Row Datatable Flag */
  multiRowDatatableFlag: boolean;

  /**
   * Fetches data table data from `resolve`
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute) {
    this.entityId = this.route.parent.parent.snapshot.paramMap.get('loanId');
    this.entityDatatable = null;
    this.route.data.subscribe((data: { loanDatatable: any }) => {
      this.entityDatatable = data.loanDatatable;
      this.multiRowDatatableFlag = this.entityDatatable.columnHeaders[0].columnName === 'id' ? true : false;
    });
  }

}
