import { Component} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'mifosx-datatable-tab',
  templateUrl: './datatable-tab.component.html',
  styleUrls: ['./datatable-tab.component.scss']
})
export class DatatableTabComponent {

    /** Center Datatable */
    centerDatatable: any;
    /** Multi Row Datatable Flag */
    multiRowDatatableFlag: boolean;

    /**
     * Fetches data table data from `resolve`
     * @param {ActivatedRoute} route Activated Route.
     */
    constructor(private route: ActivatedRoute) {
      this.route.data.subscribe((data: { centerDatatable: any }) => {
        this.centerDatatable = data.centerDatatable;
        this.multiRowDatatableFlag = this.centerDatatable.columnHeaders[0].columnName === 'id' ? true : false;
      });
    }

}
