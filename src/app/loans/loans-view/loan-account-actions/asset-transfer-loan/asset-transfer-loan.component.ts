/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, OnInit, inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Dates } from 'app/core/utils/dates';
import { ExternalAssetOwnerService } from 'app/loans/services/external-asset-owner.service';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { LoanAccountActionsBaseComponent } from '../loan-account-actions-base.component';

@Component({
  selector: 'mifosx-asset-transfer-loan',
  templateUrl: './asset-transfer-loan.component.html',
  styleUrls: ['./asset-transfer-loan.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS
  ]
})
export class AssetTransferLoanComponent extends LoanAccountActionsBaseComponent implements OnInit {
  private formBuilder = inject(UntypedFormBuilder);
  private externalAssetOwnerService = inject(ExternalAssetOwnerService);
  private dateUtils = inject(Dates);

  BUYBACK_COMMAND = 'buyback';
  SALE_COMMAND = 'sale';

  command: string;
  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Date allowed. */
  maxDate = new Date();
  /** Sell Loan Form */
  saleLoanForm: UntypedFormGroup;

  constructor() {
    super();
    const actionName = this.route.snapshot.params['action'];
    this.command = actionName === 'Sell Loan' ? this.SALE_COMMAND : this.BUYBACK_COMMAND;
  }

  /**
   * Creates the Sell Loan form
   * and initialize with the required values
   */
  ngOnInit() {
    this.minDate = this.settingsService.businessDate;
    this.maxDate = this.settingsService.maxAllowedDate;
    this.createSaleLoanForm();
  }

  isBuyBack(): boolean {
    return this.command === this.BUYBACK_COMMAND;
  }

  /**
   * Creates the create close form.
   */
  createSaleLoanForm() {
    this.saleLoanForm = this.formBuilder.group({
      settlementDate: [
        this.settingsService.businessDate,
        Validators.required
      ],
      purchasePriceRatio: [
        '',
        Validators.required
      ],
      transferExternalId: '',
      ownerExternalId: [
        '',
        Validators.required
      ]
    });

    if (this.isBuyBack()) {
      this.saleLoanForm.removeControl('purchasePriceRatio');
      this.saleLoanForm.removeControl('ownerExternalId');
    }
  }

  submit() {
    const saleLoanFormData = this.saleLoanForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevsettlementDate: Date = this.saleLoanForm.value.settlementDate;
    if (saleLoanFormData.settlementDate instanceof Date) {
      saleLoanFormData.settlementDate = this.dateUtils.formatDate(prevsettlementDate, dateFormat);
    }
    const data = {
      ...saleLoanFormData,
      dateFormat,
      locale
    };
    this.externalAssetOwnerService
      .executeExternalAssetOwnerLoanCommand(this.loanId, data, this.command)
      .subscribe((response: any) => {
        this.gotoLoanView('external-asset-owner');
      });
  }
}
