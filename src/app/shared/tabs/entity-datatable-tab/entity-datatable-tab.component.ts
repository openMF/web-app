import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'mifosx-entity-datatable-tab',
  templateUrl: './entity-datatable-tab.component.html',
  styleUrls: ['./entity-datatable-tab.component.scss']
})
export class EntityDatatableTabComponent implements OnInit {

  @Input() multiRowDatatableFlag = false;
  @Input() entityDatatable: any;
  @Input() entityType: string;
  @Input() entityId: string;

  constructor() { }

  ngOnInit(): void {
  }

}
