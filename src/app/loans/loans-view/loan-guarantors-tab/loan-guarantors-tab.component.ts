/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  MatTable,
  MatColumnDef,
  MatHeaderCellDef,
  MatHeaderCell,
  MatCellDef,
  MatCell,
  MatHeaderRowDef,
  MatHeaderRow,
  MatRowDef,
  MatRow,
  MatNoDataRow
} from '@angular/material/table';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { LoansService } from 'app/loans/loans.service';
import { LoanProductService } from 'app/products/loan-products/services/loan-product.service';
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';
import { LoansAccountViewGuarantorDetailsDialogComponent } from 'app/loans/custom-dialog/loans-account-view-guarantor-details-dialog/loans-account-view-guarantor-details-dialog.component';
import { EditGuarantorDialogComponent } from 'app/loans/custom-dialog/edit-guarantor-dialog/edit-guarantor-dialog.component';
import { AccountsFilterPipe } from '../../../pipes/accounts-filter.pipe';
import { FormatNumberPipe } from '../../../pipes/format-number.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Guarantors tab of the loan account view.
 */
@Component({
  selector: 'mifosx-loan-guarantors-tab',
  templateUrl: './loan-guarantors-tab.component.html',
  styleUrls: ['./loan-guarantors-tab.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    RouterLink,
    FaIconComponent,
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatNoDataRow,
    AccountsFilterPipe,
    FormatNumberPipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoanGuarantorsTabComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute);
  private dialog = inject(MatDialog);
  private loansService = inject(LoansService);
  private cdr = inject(ChangeDetectorRef);
  protected loanProductService = inject(LoanProductService);

  loanId: string;
  /** Loan account details, resolved by the parent loan view. */
  loanDetails: any = {};
  /** GET /loans/{loanId}/guarantors, which is the guarantor list itself. */
  guarantors: any[] = [];
  showDeletedGuarantors = false;
  /** Delinquency summary, only read when opening the guarantor details dialog. */
  private delinquent: any;
  displayedColumns: string[] = [
    'fullname',
    'relationship',
    'guarantortype',
    'depositAccount',
    'amount',
    'remainingAmount',
    'status',
    'action'
  ];

  constructor() {
    this.loanId = this.route.snapshot.paramMap.get('loanId') || this.route.parent.snapshot.paramMap.get('loanId');
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { loanGuarantors: any[] }) => {
      this.guarantors = data.loanGuarantors || [];
    });
    this.route.parent.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { loanDetailsData: any }) => {
      this.loanDetails = data.loanDetailsData || {};
    });
  }

  ngOnInit() {
    // Available disbursement amount with over applied, shown in the guarantor details dialog.
    this.loansService.getLoanDelinquencyDataForTemplate(this.loanId).subscribe((delinquencyData: any) => {
      // Fineract nests the amount in `delinquent`; older versions return it at the root.
      this.delinquent =
        delinquencyData.availableDisbursementAmountWithOverApplied === undefined
          ? delinquencyData.delinquent
          : {
              ...delinquencyData.delinquent,
              availableDisbursementAmountWithOverApplied: delinquencyData.availableDisbursementAmountWithOverApplied
            };
    });
  }

  /** Guarantors can only be added while the loan is pending approval, approved or active. */
  get canCreateGuarantor(): boolean {
    const status = this.loanDetails.status;
    return !!(status?.pendingApproval || status?.waitingForDisbursal || status?.active);
  }

  toggleDeletedGuarantors() {
    this.showDeletedGuarantors = !this.showDeletedGuarantors;
  }

  deleteGuarantor(id: any) {
    const deleteGuarantorDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `the guarantor id: ${id}` }
    });
    deleteGuarantorDialogRef.afterClosed().subscribe((response?: { delete?: boolean }) => {
      if (response?.delete) {
        this.loansService.deleteGuarantor(this.loanId, id).subscribe(() => {
          this.refreshGuarantors();
        });
      }
    });
  }

  viewGuarantorDetails(guarantorData: any) {
    this.dialog.open(LoansAccountViewGuarantorDetailsDialogComponent, {
      data: {
        guarantorData: guarantorData,
        loanData: { ...this.loanDetails, delinquent: this.delinquent ?? this.loanDetails.delinquent }
      }
    });
  }

  editGuarantor(guarantorData: any) {
    this.loansService.getGuarantorTemplate(this.loanId).subscribe((templateData: any) => {
      const editDialogRef = this.dialog.open(EditGuarantorDialogComponent, {
        data: {
          guarantorData: guarantorData,
          relationTypes: templateData.allowedClientRelationshipTypes
        }
      });
      editDialogRef.afterClosed().subscribe((result: any) => {
        if (result) {
          const payload = {
            ...result,
            guarantorTypeId: guarantorData.guarantorType.id
          };
          Object.keys(payload).forEach((key) => {
            if (payload[key] === '' || payload[key] === null || payload[key] === undefined) {
              delete payload[key];
            }
          });
          this.loansService.updateGuarantor(this.loanId, guarantorData.id, payload).subscribe(() => {
            this.refreshGuarantors();
          });
        }
      });
    });
  }

  /**
   * Re-fetches guarantor data in place without navigating away.
   */
  private refreshGuarantors() {
    this.loansService.getGuarantors(this.loanId).subscribe((data: any) => {
      this.guarantors = data || [];
      this.cdr.markForCheck();
    });
  }
}
