/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { FixedDepositsService } from '../../fixed-deposits.service';

/**
 * Close On Maturity Fixed Deposits Account Component
 */
@Component({
  selector: 'mifosx-close-fixed-deposits-account',
  templateUrl: './close-fixed-deposits-account.component.html',
  styleUrls: ['./close-fixed-deposits-account.component.scss']
})
export class CloseFixedDepositsAccountComponent implements OnInit {

  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date();
  /** Close on maturity FD Account form. */
  closeOnMaturityAccountForm: FormGroup;
  /** Savings Account Data */
  savingsAccountsData: any;
  /** On account Closure Options */
  onAccountClosureOptions: any;
  /** Fixed Deposits Account Id */
  accountId: any;
  /** Maturity Amount */
  maturityAmount: any;

  /**
   * Fetches close action data from `resolve`
   * @param {FormBuilder} formBuilder Form Builder
   * @param {FixedDepositsService} fixedDepositsService Fixed Deposits Service
   * @param {DatePipe} datePipe Date Pipe
   * @param {ActivatedRoute} route Activated Route
   * @param {Router} router Router
   */
  constructor(private formBuilder: FormBuilder,
              private fixedDepositsService: FixedDepositsService,
              private datePipe: DatePipe,
              private route: ActivatedRoute,
              private router: Router) {
    this.route.data.subscribe((data: { fixedDepositsAccountActionData: any }) => {
      this.savingsAccountsData = data.fixedDepositsAccountActionData.savingsAccounts;
      this.onAccountClosureOptions = data.fixedDepositsAccountActionData.onAccountClosureOptions;
      this.maturityAmount = data.fixedDepositsAccountActionData.maturityAmount;
    });
    this.accountId = this.route.parent.snapshot.params['fixedDepositAccountId'];
  }

  /**
   * Creates the close on maturity fd account form.
   */
  ngOnInit() {
    this.createCloseOnMaturityAccountForm();
    this.addTransferDetails();
  }

  /**
   * Creates the close on maturity fd account form.
   */
  createCloseOnMaturityAccountForm() {
    this.closeOnMaturityAccountForm = this.formBuilder.group({
      'closedOnDate': ['', Validators.required],
      'maturityAmount': [{value: this.maturityAmount, disabled: true}],
      'onAccountClosureId': ['', Validators.required],
      'note': ['']
    });
  }

  /**
   * Subscribes to value changes of `onAccountClosureId` adds and removes transfer details accordingly.
   */
  addTransferDetails() {
    this.closeOnMaturityAccountForm.get('onAccountClosureId').valueChanges.subscribe((id: any) => {
      if (id === 200) {
        this.closeOnMaturityAccountForm.addControl('toSavingsAccountId', new FormControl('', Validators.required));
        this.closeOnMaturityAccountForm.addControl('transferDescription', new FormControl(''));
      } else {
        this.closeOnMaturityAccountForm.removeControl('toSavingsAccountId');
        this.closeOnMaturityAccountForm.removeControl('transferDescription');
      }
    });
  }

  /**
   * Submits the form and close the fd account on maturity,
   * if successful redirects to the fd account.
   */
  submit() {
    // TODO: Update once language and date settings are setup
    const locale = 'en';
    const dateFormat = 'dd MMMM yyyy';
    const prevClosedDate: Date = this.closeOnMaturityAccountForm.value.closedOnDate;
    this.closeOnMaturityAccountForm.patchValue({
      closedOnDate: this.datePipe.transform(prevClosedDate, dateFormat),
    });
    const data = {
      ...this.closeOnMaturityAccountForm.value,
      dateFormat,
      locale
    };
    this.fixedDepositsService.executeFixedDepositsAccountCommand(this.accountId, 'close', data).subscribe(() => {
      this.router.navigate(['../../'], { relativeTo: this.route });
    });
  }

}
