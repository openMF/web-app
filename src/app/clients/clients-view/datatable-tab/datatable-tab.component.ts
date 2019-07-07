import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'mifosx-datatable-tab',
  templateUrl: './datatable-tab.component.html',
  styleUrls: ['./datatable-tab.component.scss']
})
export class DatatableTabComponent implements OnInit {
  clientDatatable: any;
  multiRowDatatableFlag: boolean;
  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe((data: { clientDatatable: any }) => {
      this.clientDatatable = data.clientDatatable;
      this.multiRowDatatableFlag = this.clientDatatable.columnHeaders[0].columnName === 'id' ? true : false;
    });

  }

  ngOnInit() {
  }

}
