/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { DatePipe } from '@angular/common';

/** Custom Services */
import { RecurringDepositsService } from '../recurring-deposits.service';

/** Custom Buttons Configuration */
import { RecurringDepositsButtonsConfiguration } from './recurring-deposits-buttons.config';

/**
 * RecurringDeposits Account View Component
 */
@Component({
  selector: 'mifosx-recurring-deposits-account-view',
  templateUrl: './recurring-deposits-account-view.component.html',
  styleUrls: ['./recurring-deposits-account-view.component.scss']
})
export class RecurringDepositsAccountViewComponent implements OnInit {

  /** RecurringDeposits Account Data */
  recurringDepositsAccountData: any;
  buttonConfig: RecurringDepositsButtonsConfiguration;
  charges: any;
  /** Savings Data Tables */
  savingsDatatables: any;
  /**
   * Fetches recurringDeposits account data from `resolve`
   * @param {ActivatedRoute} route Activated Route
   * @param {Router} router Router
   * @param {RecurringDepositsService} recurringDepositsService RecurringDeposits Service
   */
  constructor(private route: ActivatedRoute,
              private router: Router,
              private datePipe: DatePipe,
              private recurringDepositsService: RecurringDepositsService,
              public dialog: MatDialog) {
    this.route.data.subscribe((data: { recurringDepositsAccountData: any, savingsDatatables: any }) => {
      this.recurringDepositsAccountData = data.recurringDepositsAccountData;
      this.charges = this.recurringDepositsAccountData.charges;
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
    const status = this.recurringDepositsAccountData.status.value;
    this.buttonConfig = new RecurringDepositsButtonsConfiguration(status);
    if (this.recurringDepositsAccountData.clientId && this.recurringDepositsAccountData.status.value === 'Matured') {
      this.buttonConfig.addOption({
        name: 'Transfer Funds',
      });
    }

    if (this.recurringDepositsAccountData.charges && this.recurringDepositsAccountData.status.value === 'Matured') {
      this.charges.forEach((element: any) => {
        if (element.name === 'Annual fee - INR') {
          this.buttonConfig.addOption({
            name: 'Apply Annual Fees',
          });
        }
      });
    }
  }

  /**
   * Performs action button/option action.
   * @param {string} name action name.
   */
  doAction(name: string) {
    switch (name) {
      case 'Activate':
      case 'Approve':
      case 'Reject':
      case 'Undo Approval':
      case 'Withdraw By Client':
        this.router.navigate([`actions/${name}`], { relativeTo: this.route });
        break;
    }
  }

}
