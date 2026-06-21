/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { EntityDatatableTabComponent } from '../../../shared/tabs/entity-datatable-tab/entity-datatable-tab.component';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Savings Datatable Tabs Component
 */
@Component({
  selector: 'mifosx-datatable-tabs',
  templateUrl: './datatable-tabs.component.html',
  styleUrls: ['./datatable-tabs.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    EntityDatatableTabComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatatableTabsComponent {
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  entityId: string;
  /** Savings Datatable */
  entityDatatable: any;
  /** Multi Row Datatable Flag */
  multiRowDatatableFlag: boolean;

  /**
   * Fetches Savings and datatables data from `resolve`
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor() {
    this.entityId = this.route.parent.parent.snapshot.paramMap.get('savingAccountId');

    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { savingsDatatable: any }) => {
      this.entityDatatable = data.savingsDatatable;
      this.multiRowDatatableFlag = this.entityDatatable.columnHeaders[0].columnName === 'id' ? true : false;
    });
  }
}
