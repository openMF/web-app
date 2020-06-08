/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SavingsButtonsConfiguration } from './savings-buttons.config';

/**
 * Savings Account View Component
 */
@Component({
  selector: 'mifosx-savings-account-view',
  templateUrl: './savings-account-view.component.html',
  styleUrls: ['./savings-account-view.component.scss']
})
export class SavingsAccountViewComponent implements OnInit {

  /** Savings Account Data */
  savingsAccountData: any;
  /** Button Configurations */
  buttonConfig: SavingsButtonsConfiguration;

  /**
   * Fetches savings account data from `resolve`
   * @param {ActivatedRoute} route Activated Route
   */
  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe((data: { savingsAccountData: any }) => {
      this.savingsAccountData = data.savingsAccountData;
    });
  }

  ngOnInit() {
    this.setConditionalButtons();
  }

  /**
   * Adds options to button config. conditionaly.
   */
  setConditionalButtons() {
    const status = this.savingsAccountData.status.value;
    this.buttonConfig = new SavingsButtonsConfiguration(status);
    if (this.savingsAccountData.clientId) {
      this.buttonConfig.addOption({
        name: 'Transfer Funds',
        taskPermissionName: 'CREATE_ACCOUNTTRANSFER'
      });
    }
    if (!this.savingsAccountData.fieldOfficerId) {
      this.buttonConfig.addOption({
        name: 'Assign Staff',
        taskPermissionName: 'UPDATESAVINGSOFFICER_SAVINGSACCOUNT'
      });
    } else {
      this.buttonConfig.addOption({
        name: 'Unassign Staff',
        taskPermissionName: 'REMOVESAVINGSOFFICER_SAVINGSACCOUNT'
      });
    }
    if (this.savingsAccountData.charges) {
      const charges: any[] = this.savingsAccountData.charges;
      charges.forEach((charge: any) => {
        if (charge.name === 'Annual fee - INR') {
          this.buttonConfig.addOption({
            name: 'Apply Anuual Fees',
            taskPermissionName: 'APPLYANNUALFEE_SAVINGSACCOUNT'
          });
        }
      });
    }
    if (this.savingsAccountData.taxGroup) {
      if (this.savingsAccountData.withHoldTax) {
        this.buttonConfig.addOption({
          name: 'Disable Withhold Tax',
          taskPermissionName: 'UPDATEWITHHOLDTAX_SAVINGSACCOUNT'
        });
      } else {
        this.buttonConfig.addOption({
          name: 'Enable Withhold Tax',
          taskPermissionName: 'UPDATEWITHHOLDTAX_SAVINGSACCOUNT'
        });
      }
    }
  }

}
