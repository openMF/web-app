/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Component, OnInit, Input, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

/** Custom Services */
import { LoansService } from 'app/loans/loans.service';

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
export class ViewGuarantorsComponent implements OnInit {
  dialog = inject(MatDialog);
  loansService = inject(LoansService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  @Input() dataObject: any;
  loanData: any = {};
  guarantorDetails: any;
  showDeletedGuarantorsAccounts = false;
  loanId: any;
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
    this.loanId = this.route.snapshot.params['loanId'];
    // Get loan data from navigation state (passed by LoansViewComponent)
    const navData = this.router.getCurrentNavigation()?.extras?.state?.data;
    if (navData) {
      this.loanData = navData;
    } else {
      // Fallback: fetch from API (e.g. on page refresh)
      this.loansService.getLoanAccountAssociationDetails(this.loanId).subscribe((data: any) => {
        this.loanData = data || {};
      });
    }
  }

  ngOnInit() {
    this.guarantorDetails = this.dataObject;
  }

  toggleGuarantorsDetailsOverview() {
    this.showDeletedGuarantorsAccounts = !this.showDeletedGuarantorsAccounts;
  }

  deleteGuarantor(id: any) {
    const deleteGuarantorDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `the guarantor id: ${id}` }
    });
    deleteGuarantorDialogRef.afterClosed().subscribe((response: any) => {
      if (response?.delete) {
        this.loansService.deleteGuarantor(this.loanId, id).subscribe(() => {
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
      this.guarantorDetails = data;
    });
  }
}
