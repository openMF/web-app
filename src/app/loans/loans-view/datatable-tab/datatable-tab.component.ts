import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'mifosx-datatable-tab',
  templateUrl: './datatable-tab.component.html',
  styleUrls: ['./datatable-tab.component.scss']
})
export class DatatableTabComponent {

    /** Loan Datatable */
    loanDatatable: any;
    /** Multi Row Datatable Flag */
    multiRowDatatableFlag: boolean;

    /**
     * Fetches data table data from `resolve`
     * @param {ActivatedRoute} route Activated Route.
     */
    constructor(private route: ActivatedRoute) {
      this.route.data.subscribe((data: { loanDatatable: any }) => {
        this.loanDatatable = data.loanDatatable;
        this.multiRowDatatableFlag = this.loanDatatable.columnHeaders[0].columnName === 'id' ? true : false;
      });
    }

}
