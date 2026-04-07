/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Component, OnInit, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

/** Dialog Components */
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';
import { LoansAccountViewGuarantorDetailsDialogComponent } from 'app/loans/custom-dialog/loans-account-view-guarantor-details-dialog/loans-account-view-guarantor-details-dialog.component';
import { EditGuarantorDialogComponent } from 'app/loans/custom-dialog/edit-guarantor-dialog/edit-guarantor-dialog.component';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { ExternalIdentifierComponent } from '../../../../shared/external-identifier/external-identifier.component';
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
  MatRow
} from '@angular/material/table';
import { AccountsFilterPipe } from '../../../../pipes/accounts-filter.pipe';
import { FormatNumberPipe } from '../../../../pipes/format-number.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { LoanAccountActionsBaseComponent } from '../loan-account-actions-base.component';

/**
 * View Guarantors Action
 */
@Component({
  selector: 'mifosx-view-guarantors',
  templateUrl: './view-guarantors.component.html',
  styleUrls: ['./view-guarantors.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent,
    ExternalIdentifierComponent,
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
    AccountsFilterPipe,
    FormatNumberPipe
  ]
})
export class ViewGuarantorsComponent extends LoanAccountActionsBaseComponent implements OnInit {
  dialog = inject(MatDialog);

  loanData: any;
  guarantorDetails: any;
  showDeletedGuarantorsAccounts = false;
  guarantorsDisplayedColumns: string[] = [
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
    super();
    this.loanId = this.route.snapshot.params['loanId'];
    // Get loan data from navigation state (passed by LoansViewComponent)
    const navData = this.router.getCurrentNavigation()?.extras?.state?.data;
    if (navData) {
      this.loanData = navData;
    } else {
      // Fallback: fetch from API (e.g. on page refresh)
      this.loanService.getLoanAccountAssociationDetails(this.loanId).subscribe((data: any) => {
        this.loanData = data || {};
      });
    }
  }

  ngOnInit() {
    this.guarantorDetails = this.dataObject.guarantors;

    // Get delinquency data for available disbursement amount with over applied
    this.loanService.getLoanDelinquencyDataForTemplate(this.loanId).subscribe((delinquencyData: any) => {
      // Check if the field is at root level
      if (delinquencyData.availableDisbursementAmountWithOverApplied !== undefined) {
        this.dataObject.availableDisbursementAmountWithOverApplied =
          delinquencyData.availableDisbursementAmountWithOverApplied;
      }
      // Also check if it's in delinquent object
      if (delinquencyData.delinquent) {
        this.dataObject.delinquent = delinquencyData.delinquent;
      }
    });
  }

  toggleGuarantorsDetailsOverview() {
    this.showDeletedGuarantorsAccounts = !this.showDeletedGuarantorsAccounts;
  }

  deleteGuarantor(id: any) {
    const deleteGuarantorDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `the guarantor id: ${id}` }
    });
    deleteGuarantorDialogRef.afterClosed().subscribe((response?: { delete?: boolean }) => {
      if (response?.delete) {
        this.loanService.deleteGuarantor(this.loanId, id).subscribe(() => {
          this.refreshGuarantors();
        });
      }
    });
  }

  viewGuarantorDetails(guarantorData: any) {
    const viewGuarantorDetailsDialogRef = this.dialog.open(LoansAccountViewGuarantorDetailsDialogComponent, {
      data: { guarantorData: guarantorData, loanData: this.loanData }
    });
    viewGuarantorDetailsDialogRef.afterClosed().subscribe(() => {});
  }

  editGuarantor(guarantorData: any) {
    this.loanService.getGuarantorTemplate(this.loanId).subscribe((templateData: any) => {
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
          this.loanService.updateGuarantor(this.loanId, guarantorData.id, payload).subscribe(() => {
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
    this.loanService.getGuarantors(this.loanId).subscribe((data: any) => {
      this.guarantorDetails = data;
    });
  }
}
