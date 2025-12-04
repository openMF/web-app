import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EntityDatatableTabComponent } from '../../../shared/tabs/entity-datatable-tab/entity-datatable-tab.component';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-datatable-tab',
  templateUrl: './datatable-tab.component.html',
  styleUrls: ['./datatable-tab.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    EntityDatatableTabComponent
  ]
})
export class DatatableTabComponent implements OnInit {
  private route = inject(ActivatedRoute);

  entityId: string;
  /** Loan Datatable */
  entityDatatable: any = null;
  /** Multi Row Datatable Flag */
  multiRowDatatableFlag: boolean;

  /**
   * Fetches data table data from `resolve`
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor() {
    this.entityId = this.route.parent.parent.snapshot.paramMap.get('loanId');
    this.entityDatatable = null;
    this.route.data.subscribe((data: { loanDatatable: any }) => {
      this.entityDatatable = data.loanDatatable;
      this.multiRowDatatableFlag = this.entityDatatable.columnHeaders[0].columnName === 'id' ? true : false;
    });
  }

  ngOnInit() {
    this.route.parent.parent.params.subscribe((params) => {
      this.entityId = params['loanId'];
    });
  }
}
