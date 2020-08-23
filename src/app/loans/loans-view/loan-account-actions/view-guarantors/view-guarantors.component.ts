/** Angular Imports */
import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

/** Custom Services */
import { LoansService } from 'app/loans/loans.service';
import { DatePipe } from '@angular/common';

/** Dialog Components */
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';
import { LoansAccountViewGuarantorDetailsDialogComponent } from 'app/loans/custom-dialog/loans-account-view-guarantor-details-dialog/loans-account-view-guarantor-details-dialog.component';

/**
 * View Guarantors Action
 */
@Component({
  selector: 'mifosx-view-guarantors',
  templateUrl: './view-guarantors.component.html',
  styleUrls: ['./view-guarantors.component.scss']
})
export class ViewGuarantorsComponent implements OnInit {

  @Input() dataObject: any;
  guarantorDetails: any;
  showDeletedGuarantorsAccounts = false;
  loanId: any;
  guarantorsDisplayedColumns: string[] = ['fullname', 'relationship', 'guarantortype', 'depositAccount', 'amount', 'remainingAmount', 'status', 'action'];

  /** View and perform various action on existing list of guarantors
   * @param {MatDialog} dialog Dialog
   * @param {LoansService} loansService Loans Service
   * @param {route} Route Route
   * @param {router} Router Router
   */
  constructor(public dialog: MatDialog,
              public loansService: LoansService,
              private route: ActivatedRoute,
              private router: Router) {
    this.loanId = this.route.parent.snapshot.params['loanId'];
  }

  ngOnInit() {
    this.guarantorDetails = this.dataObject.guarantors;
  }

  toggleGuarantorsDetailsOverview() {
    this.showDeletedGuarantorsAccounts = !this.showDeletedGuarantorsAccounts;
  }

  deleteGuarantor(id: any) {
    const deleteGuarantorDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `the guarantor id: ${id}` }
    });
    deleteGuarantorDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.loansService.deleteGuarantor(this.loanId, id).subscribe(() => {
          this.reload();
        });
      }
    });
  }

  viewGuarantorDetails(guarantorData: any) {
    const viewGuarantorDetailsDialogRef = this.dialog.open(LoansAccountViewGuarantorDetailsDialogComponent, {
      data: { guarantorData: guarantorData }
    });
    viewGuarantorDetailsDialogRef.afterClosed().subscribe(() => {});
  }

  /**
   * Refetches data for the component
   * TODO: Replace by a custom reload component instead of hard-coded back-routing.
   */
  private reload() {
    const clientId = this.dataObject.clientId;
    const url: string = this.router.url;
    this.router.navigateByUrl(`/clients/${clientId}/loans`, { skipLocationChange: true })
      .then(() => this.router.navigate([url]));
  }

}
