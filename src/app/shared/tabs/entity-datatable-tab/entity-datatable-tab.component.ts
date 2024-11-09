import { Component, Input } from '@angular/core';

@Component({
  selector: 'mifosx-entity-datatable-tab',
  templateUrl: './entity-datatable-tab.component.html',
  styleUrls: ['./entity-datatable-tab.component.scss']
})
export class EntityDatatableTabComponent {

  @Input() multiRowDatatableFlag = false;
  @Input() entityDatatable: any;
  @Input() entityType: string;
  @Input() entityId: string;

  constructor() { }

}
