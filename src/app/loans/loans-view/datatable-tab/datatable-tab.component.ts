/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { EntityDatatableTabComponent } from '../../../shared/tabs/entity-datatable-tab/entity-datatable-tab.component';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { LoanProductService } from 'app/products/loan-products/services/loan-product.service';

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
export class DatatableTabComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute);
  private changeDetectorRef = inject(ChangeDetectorRef);

  private loanProductService = inject(LoanProductService);
  private translateService = inject(TranslateService);

  entityId: string;
  /** Loan Datatable */
  entityDatatable: any = null;
  /** Multi Row Datatable Flag */
  multiRowDatatableFlag: boolean;

  get entityType(): string {
    return this.loanProductService.isWorkingCapital
      ? this.translateService.instant('labels.inputs.Working Capital Loan Account')
      : this.translateService.instant('labels.inputs.Loan Account');
  }

  /**
   * Fetches data table data from `resolve`
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor() {
    this.entityId = this.route.parent.parent.snapshot.paramMap.get('loanId');
    this.entityDatatable = null;
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { loanDatatable: any }) => {
      this.entityDatatable = data.loanDatatable;
      this.multiRowDatatableFlag = this.entityDatatable.columnHeaders[0].columnName === 'id' ? true : false;
      this.changeDetectorRef.markForCheck();
    });
  }

  ngOnInit() {
    this.route.parent.parent.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.entityId = params['loanId'];
      this.changeDetectorRef.markForCheck();
    });
  }
}
