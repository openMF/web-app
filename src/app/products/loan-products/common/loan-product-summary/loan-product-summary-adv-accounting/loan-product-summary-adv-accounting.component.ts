/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, Input } from '@angular/core';
import { MatDivider } from '@angular/material/divider';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable
} from '@angular/material/table';
import {
  ChargeOffReasonToExpenseAccountMapping,
  ChargeToIncomeAccountMapping,
  ClassificationToIncomeAccountMapping,
  PaymentChannelToFundSourceMapping
} from 'app/shared/models/general.model';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-loan-product-summary-adv-accounting',
  templateUrl: './loan-product-summary-adv-accounting.component.html',
  styleUrl: './loan-product-summary-adv-accounting.component.scss',
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDivider,
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow
  ]
})
export class LoanProductSummaryAdvAccountingComponent {
  @Input() paymentChannelToFundSourceMappings: PaymentChannelToFundSourceMapping[] = [];
  @Input() feeToIncomeAccountMappings: ChargeToIncomeAccountMapping[] = [];
  @Input() penaltyToIncomeAccountMappings: ChargeToIncomeAccountMapping[] = [];
  @Input() chargeOffReasonToExpenseAccountMappings: ChargeOffReasonToExpenseAccountMapping[] = [];
  @Input() buydownFeeClassificationToIncomeAccountMappings: ClassificationToIncomeAccountMapping[] = [];
  @Input() capitalizedIncomeClassificationToIncomeAccountMappings: ClassificationToIncomeAccountMapping[] = [];
  @Input() writeOffReasonsToExpenseMappings: ChargeOffReasonToExpenseAccountMapping[] = [];

  paymentFundSourceDisplayedColumns: string[] = [
    'paymentTypeId',
    'fundSourceAccountId'
  ];
  feesPenaltyIncomeDisplayedColumns: string[] = [
    'chargeId',
    'incomeAccountId'
  ];
  chargeOffReasonExpenseDisplayedColumns: string[] = [
    'chargeOffReasonCodeValueId',
    'expenseAccountId'
  ];
}
