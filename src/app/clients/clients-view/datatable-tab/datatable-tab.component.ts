import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatomoTracker } from "@ngx-matomo/tracker";

@Component({
  selector: 'mifosx-datatable-tab',
  templateUrl: './datatable-tab.component.html',
  styleUrls: ['./datatable-tab.component.scss']
})
export class DatatableTabComponent implements OnInit {
  clientDatatable: any;
  multiRowDatatableFlag: boolean;
  /**
  * @param {ActivatedRoute} route Component reference to route.
  * @param {MatomoTracker} matomoTracker Matomo tracker service
  */

  constructor(private route: ActivatedRoute, private matomoTracker: MatomoTracker) {
    this.route.data.subscribe((data: { clientDatatable: any }) => {
      this.clientDatatable = data.clientDatatable;
      this.multiRowDatatableFlag = this.clientDatatable.columnHeaders[0].columnName === 'id' ? true : false;
    });

  }

  ngOnInit() {
    //set Matomo page info
    let title = document.title || "";
    this.matomoTracker.setDocumentTitle(`${title}`);
  }

}
