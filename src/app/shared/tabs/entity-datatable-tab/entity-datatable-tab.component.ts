/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

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
