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
import { EntityDatatableTabComponent } from '../../../../shared/tabs/entity-datatable-tab/entity-datatable-tab.component';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-recurring-deposit-datatable-tab',
  templateUrl: './recurring-deposit-datatable-tab.component.html',
  styleUrls: ['./recurring-deposit-datatable-tab.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    EntityDatatableTabComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecurringDepositDatatableTabComponent {
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  entityId: string;
  entityDatatable: any;
  multiRowDatatableFlag: boolean;

  constructor() {
    this.entityId = this.route.parent.parent.snapshot.paramMap.get('productId');

    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { recurringDepositDatatable: any }) => {
      this.entityDatatable = data.recurringDepositDatatable;
      this.multiRowDatatableFlag = this.entityDatatable.columnHeaders[0].columnName === 'id' ? true : false;
    });
  }
}
