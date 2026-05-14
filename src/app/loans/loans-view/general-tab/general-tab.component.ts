/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  MatTableDataSource,
  MatTable,
  MatColumnDef,
  MatCellDef,
  MatCell,
  MatRowDef,
  MatRow
} from '@angular/material/table';
import { CurrencyPipe } from '@angular/common';
import { ExternalIdentifierComponent } from '../../../shared/external-identifier/external-identifier.component';
import { DateFormatPipe } from '../../../pipes/date-format.pipe';
import { FormatNumberPipe } from '../../../pipes/format-number.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { LoanProductService } from 'app/products/loan-products/services/loan-product.service';
import { LoanProductBaseComponent } from 'app/products/loan-products/common/loan-product-base.component';
import { LoanViewAttribute } from 'app/loans/models/loan-account.model';
import { LoanSummaryBalanceComponentComponent } from './loan-summary-balance-component/loan-summary-balance-component.component';

@Component({
  selector: 'mifosx-general-tab',
  templateUrl: './general-tab.component.html',
  styleUrls: ['./general-tab.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatTable,
    MatColumnDef,
    MatCellDef,
    MatCell,
    MatRowDef,
    MatRow,
    ExternalIdentifierComponent,
    CurrencyPipe,
    DateFormatPipe,
    FormatNumberPipe,
    LoanSummaryBalanceComponentComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GeneralTabComponent extends LoanProductBaseComponent implements OnInit {
  private route = inject(ActivatedRoute);

  /** Currency Code */
  currencyCode: string | null = null;
  loanDetails: any;
  status: any;

  loanDetailsColumns: string[] = [
    'Key',
    'Value'
  ];
  loanDetailsTableData: LoanViewAttribute[] = [];
  hasChargeBack: boolean = false;

  /** Data source for loans summary table. */
  detailsDataSource: MatTableDataSource<any>;

  constructor() {
    super();
    const productType = this.route.snapshot.queryParamMap.get('productType') || null;
    if (productType) {
      this.loanProductService.initialize(productType);
    }
    this.route.parent.data.subscribe((data: { loanDetailsData: any }) => {
      this.loanDetails = data.loanDetailsData;
      this.currencyCode = this.loanDetails.currency.code;
      if (this.loanDetails.transactions) {
        this.loanDetails.transactions.some((transaction: any) => {
          if (transaction.type.code === 'loanTransactionType.chargeback') {
            this.hasChargeBack = true;
            return;
          }
        });
      }
    });
  }

  ngOnInit() {
    this.status = this.loanDetails.value;
    if (this.loanDetails.summary) {
      this.setloanDetailsTableData();
    } else {
      this.setloanNonDetailsTableData();
    }
  }

  setloanDetailsTableData() {
    this.loanDetailsTableData = [
      {
        key: 'Product Type'
      },
      {
        key: 'Product Name'
      },
      {
        key: 'Status'
      },
      {
        key: 'Disbursement Date'
      },
      {
        key: 'Currency'
      },
      {
        key: 'External Id'
      },
      {
        key: 'Proposed Amount',
        value: this.loanDetails.proposedPrincipal
      },
      {
        key: 'Approved Amount',
        value: this.loanDetails.approvedPrincipal
      },
      {
        key: 'Disburse Amount',
        value: this.loanDetails.principal
      }
    ];
    if (this.loanDetails.writeOffReason) {
      this.loanDetailsTableData.push({
        key: 'Write-off Reason',
        value: this.loanDetails.writeOffReason
      });
    }
    if (this.loanProductService.isLoanProduct) {
      this.loanDetailsTableData.push({
        key: 'Loan Officer'
      });
    }
    this.detailsDataSource = new MatTableDataSource(this.loanDetailsTableData);
  }

  setloanNonDetailsTableData() {
    this.loanDetailsTableData = [
      {
        key: 'Product Type'
      },
      {
        key: 'Product Name'
      },
      {
        key: 'Status'
      },
      {
        key: 'Disbursement Date'
      },
      {
        key: 'Currency'
      },
      {
        key: 'External Id'
      }
    ];
    if (this.loanProductService.isLoanProduct) {
      this.loanDetailsTableData.push({
        key: 'Loan Officer'
      });
      this.loanDetailsTableData.push({
        key: 'Loan Purpose'
      });
    }
    this.detailsDataSource = new MatTableDataSource(this.loanDetailsTableData);
  }

  showApprovedAmountBasedOnStatus() {
    if (
      this.status === 'Submitted and pending approval' ||
      this.status === 'Withdrawn by applicant' ||
      this.status === 'Rejected'
    ) {
      return false;
    }
    return true;
  }

  showDisbursedAmountBasedOnStatus = function () {
    if (
      this.status === 'Submitted and pending approval' ||
      this.status === 'Withdrawn by applicant' ||
      this.status === 'Rejected' ||
      this.status === 'Approved'
    ) {
      return false;
    }
    return true;
  };

  loanProductType(): string {
    return this.loanDetails.loanType
      ? LoanProductService.productTypeLabel('loan')
      : LoanProductService.productTypeLabel('working-capital');
  }
}
