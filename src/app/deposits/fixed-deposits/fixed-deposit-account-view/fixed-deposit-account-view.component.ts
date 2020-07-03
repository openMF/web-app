/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material';

/** Custom Button Config. */
import { FixedDepositsButtonsConfiguration } from './fixed-deposits-buttons.config';

/** Custom Services */
import { FixedDepositsService } from '../fixed-deposits.service';

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
  constructor(private route: ActivatedRoute,
              private router: Router,
              private fixedDepositsService: FixedDepositsService,
              public dialog: MatDialog) {
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

  /**
   * Performs action button/option action.
   * @param {string} name action name.
   */
  doAction(name: string) {
    switch (name) {
      case 'Approve':
      case 'Reject':
      case 'Deposit':
      case 'Activate':
      case 'Close':
      case 'Undo Approval':
      case 'Post Interest As On':
      case 'Assign Staff':
      case 'Add Charge':
      case 'Unassign Staff':
      case 'Withdraw By Client':
        this.router.navigate([`actions/${name}`], { relativeTo: this.route });
        break;
      case 'Withdraw':
        this.router.navigate([`actions/Withdrawal`], { relativeTo: this.route });
        break;
      case 'Modify Application':
        this.router.navigate(['edit-savings-account'], { relativeTo: this.route });
        break;
      case 'Delete':

        break;
      case 'Calculate Interest':

        break;
      case 'Post Interest':

        break;
      case 'Enable Withhold Tax':

        break;
      case 'Disable Withhold Tax':

        break;
    }
  }


}
