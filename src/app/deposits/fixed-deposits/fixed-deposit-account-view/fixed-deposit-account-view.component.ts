/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FixedDepositsButtonsConfiguration } from './fixed-deposits-buttons.config';

/**
 * Fixed Deposits Account View Component
 */
@Component({
  selector: 'mifosx-fixed-deposit-account-view',
  templateUrl: './fixed-deposit-account-view.component.html',
  styleUrls: ['./fixed-deposit-account-view.component.scss']
})
export class FixedDepositAccountViewComponent implements OnInit {

  /** Fixed Deposits Account Data */
  fixedDepositsAccountData: any;
  /** Savings Data Tables */
  savingsDatatables: any;
  /** Button Configurations */
  buttonConfig: FixedDepositsButtonsConfiguration;

  /**
   * Fetches fixed deposits account data from `resolve`
   * @param {ActivatedRoute} route Activated Route
   */
  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe((data: { fixedDepositsAccountData: any, savingsDatatables: any  }) => {
      this.fixedDepositsAccountData = data.fixedDepositsAccountData;
      this.savingsDatatables = data.savingsDatatables;
    });
  }

  ngOnInit() {
    this.setConditionalButtons();
  }

  /**
   * Adds options to button config. conditionaly.
   */
  setConditionalButtons() {
    const status = this.fixedDepositsAccountData.status.value;
    this.buttonConfig = new FixedDepositsButtonsConfiguration(status);
    if (this.fixedDepositsAccountData.taxGroup && status === 'Active') {
      if (this.fixedDepositsAccountData.withHoldTax) {
        this.buttonConfig.addOption({
          name: 'Disable Withhold Tax'
        });
      } else {
        this.buttonConfig.addOption({
          name: 'Enable Withhold Tax'
        });
      }
    }
  }

}
