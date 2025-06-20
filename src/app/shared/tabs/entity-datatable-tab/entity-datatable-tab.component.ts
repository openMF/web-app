import { Component, Input } from '@angular/core';
import { DatatableMultiRowComponent } from './datatable-multi-row/datatable-multi-row.component';
import { DatatableSingleRowComponent } from './datatable-single-row/datatable-single-row.component';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-entity-datatable-tab',
  templateUrl: './entity-datatable-tab.component.html',
  styleUrls: ['./entity-datatable-tab.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    DatatableMultiRowComponent,
    DatatableSingleRowComponent
  ]
})
export class EntityDatatableTabComponent {
  @Input() multiRowDatatableFlag = false;
  @Input() entityDatatable: any;
  @Input() entityType: string;
  @Input() entityId: string;

  constructor() {}
}
