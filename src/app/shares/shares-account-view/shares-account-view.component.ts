/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

/** Custom Dialogs */
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';

/** Custom Services */
import { SharesService } from '../shares.service';

/** Custom Buttons Configuration */
import { SharesButtonsConfiguration } from './shares-buttons.config';

/**
 * Shares Account View
 */
@Component({
  selector: 'mifosx-shares-account-view',
  templateUrl: './shares-account-view.component.html',
  styleUrls: ['./shares-account-view.component.scss']
})
export class SharesAccountViewComponent implements OnInit {

  /** Shares Account Data */
  sharesAccountData: any;
  /** Button Configurations */
  buttonConfig: SharesButtonsConfiguration;

  /**
   * Fetches shares account data from `resolve`
   * @param {ActivatedRoute} route Activated Route
   * @param {Router} router Router
   * @param {SharesService} sharesService Shares Service
   * @param {MatDialog} dialog Mat Dialog
   */
  constructor(private route: ActivatedRoute,
              private router: Router,
              private sharesService: SharesService,
              public dialog: MatDialog) {
    this.route.data.subscribe((data: { sharesAccountData: any }) => {
      this.sharesAccountData = data.sharesAccountData;
    });
  }

  ngOnInit() {
    this.setConditionalButtons();
  }

  /**
   * Adds options to button config. conditionaly.
   */
  setConditionalButtons() {
    const status = this.sharesAccountData.status.value;
    this.buttonConfig = new SharesButtonsConfiguration(status);
    if (this.sharesAccountData.charges) {
      const charges: any[] = this.sharesAccountData.charges;
      charges.forEach((charge: any) => {
        if (charge.name === 'Annual fee - INR') {
          this.buttonConfig.addOption({
            name: 'Apply Anuual Fees',
            taskPermissionName: 'APPLYANNUALFEE_SAVINGSACCOUNT'
          });
        }
      });
    }
    if (status === 'Active') {
      const purchasedShares: any[] = this.sharesAccountData.purchasedShares;
      let sharesPendingForApproval = false;
      purchasedShares.forEach((share: any) => {
        if (share.status.code === 'purchasedSharesStatusType.applied' && share.type.code === 'purchasedSharesType.purchased') {
          sharesPendingForApproval = true;
        }
      });
      if (!sharesPendingForApproval) {
        this.buttonConfig.removeButton('Approve Additional Shares');
        this.buttonConfig.removeButton('Reject Additional Shares');
      }
    }
  }

  /**
   * Performs button action
   * @param {string} name Action name
   */
  doAction(name: string) {
    switch (name) {
      case 'Approve':
      case 'Reject':
      case 'Close':
      case 'Activate':
      case 'Undo Approval':
      case 'Apply Additional Shares':
      case 'Redeem Shares':
      case 'Approve Additional Shares':
      case 'Reject Additional Shares':
        this.router.navigate([`actions/${name}`], { relativeTo: this.route });
        break;
      case 'Modify Application':
        this.router.navigate(['edit'], { relativeTo: this.route });
        break;
      case 'Delete':
        this.deleteSharesAccount();
        break;
    }
  }

  /**
   * Deletes Shares Account.
   */
  private deleteSharesAccount() {
    const deleteSharesAccountDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `shares account with id: ${this.sharesAccountData.id}` }
    });
    deleteSharesAccountDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.sharesService.deleteSharesAccount(this.sharesAccountData.id).subscribe(() => {
          this.router.navigate(['../../'], { relativeTo: this.route });
        });
      }
    });
  }

}
