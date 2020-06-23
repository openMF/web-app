/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

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
   */
  constructor(private route: ActivatedRoute,
              private router: Router) {
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
      case 'Modify Application':
        this.router.navigate(['edit-shares-account'], { relativeTo: this.route });
        break;
      case 'Approve':
        this.router.navigate(['actions/Approve'], { relativeTo: this.route });
        break;
    }
  }

}
