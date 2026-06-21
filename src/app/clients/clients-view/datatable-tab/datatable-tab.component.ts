/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatatableTabComponent {
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  entityId: string;
  entityDatatable: any;
  multiRowDatatableFlag: boolean;

  constructor() {
    this.entityId = this.route.parent.parent.snapshot.paramMap.get('clientId');

    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { clientDatatable: any }) => {
      this.entityDatatable = data.clientDatatable;
      this.multiRowDatatableFlag = this.entityDatatable.columnHeaders[0].columnName === 'id' ? true : false;
    });
  }
}
