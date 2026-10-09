/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { EntityDatatableTabComponent } from '../../../../shared/tabs/entity-datatable-tab/entity-datatable-tab.component';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { LoanProductService } from '../../services/loan-product.service';

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
  private loanProductService = inject(LoanProductService);
  private translateService = inject(TranslateService);

  entityId: string;
  entityDatatable: any;
  multiRowDatatableFlag: boolean;

  get entityType(): string {
    return this.loanProductService.isWorkingCapital
      ? this.translateService.instant('labels.inputs.Working Capital Loan Product')
      : this.translateService.instant('labels.inputs.Loan Product');
  }

  constructor() {
    this.entityId = this.route.parent.parent.snapshot.paramMap.get('productId');

    this.route.data.subscribe((data: { loanProductDatatable: any }) => {
      this.entityDatatable = data.loanProductDatatable;
      this.multiRowDatatableFlag = this.entityDatatable.columnHeaders[0].columnName === 'id' ? true : false;
    });
  }
}
