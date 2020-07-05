/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { FixedDepositsService } from '../../fixed-deposits.service';

/**
 * Premature Close Fixed Deposits Account Component
 */
@Component({
  selector: 'mifosx-premature-close-fixed-deposits-account',
  templateUrl: './premature-close-fixed-deposits-account.component.html',
  styleUrls: ['./premature-close-fixed-deposits-account.component.scss']
})
export class PrematureCloseFixedDepositsAccountComponent implements OnInit {

  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date();
  /** Premature Close FD Account form. */
  prematureCloseAccountForm: FormGroup;
  /** Savings Account Data */
  savingsAccountsData: any;
  /** On account Closure Options */
  onAccountClosureOptions: any;
  /** Fixed Deposits Account Id */
  accountId: any;
  /** Form submission event */
  isSubmitted = false;


  /**
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
    this.accountId = this.route.parent.snapshot.params['fixedDepositAccountId'];
  }

  /**
   * Creates the premature close fd account form.
   */
  ngOnInit() {
    this.createPrematureCloseAccountForm();
    this.buildDependencies();
  }

  /**
   * Creates the premature close fd account form.
   */
  createPrematureCloseAccountForm() {
    this.prematureCloseAccountForm = this.formBuilder.group({
      'closedOnDate': ['', Validators.required]
    });
  }

  /**
   * Subscribes to value changes of parent control.
   */
  buildDependencies() {
    this.prematureCloseAccountForm.get('closedOnDate').valueChanges.subscribe((value: Date) => {
      if (!this.isSubmitted) {
        this.calculatePrematureAmount(value);
      }
    });
  }

  /**
   * Calculates prematue amount based on closed on date.
   * @param {Date} date Premature Close Date
   */
  calculatePrematureAmount(date: Date) {
    // TODO: Update once language and date settings are setup
    const locale = 'en';
    const dateFormat = 'dd MMMM yyyy';
    const data = {
      closedOnDate: this.datePipe.transform(date, dateFormat),
      dateFormat,
      locale
    };
    this.fixedDepositsService.executeFixedDepositsAccountCommand(this.accountId, 'calculatePrematureAmount', data)
      .subscribe((response: any) => {
        this.savingsAccountsData = response.savingsAccounts;
        this.onAccountClosureOptions = response.onAccountClosureOptions;
        this.prematureCloseAccountForm.addControl('maturityAmount', new FormControl({value: '', disabled: true}));
        this.prematureCloseAccountForm.addControl('onAccountClosureId', new FormControl('', Validators.required));
        this.prematureCloseAccountForm.addControl('note', new FormControl(''));
        this.prematureCloseAccountForm.get('maturityAmount').patchValue(response.maturityAmount);
        this.addTransferDetails();
      });

  }

  /**
   * Subscribes to value changes of `onAccountClosureId` adds and removes transfer details accordingly.
   */
  addTransferDetails() {
    this.prematureCloseAccountForm.get('onAccountClosureId').valueChanges.subscribe((id: any) => {
      if (id === 200) {
        this.prematureCloseAccountForm.addControl('toSavingsAccountId', new FormControl('', Validators.required));
        this.prematureCloseAccountForm.addControl('transferDescription', new FormControl(''));
      } else {
        this.prematureCloseAccountForm.removeControl('toSavingsAccountId');
        this.prematureCloseAccountForm.removeControl('transferDescription');
      }
    });
  }

  /**
   * Submits the form and premature closes the fd account,
   * if successful redirects to the fd account.
   */
  submit() {
    this.isSubmitted = true;
    // TODO: Update once language and date settings are setup
    const locale = 'en';
    const dateFormat = 'dd MMMM yyyy';
    const prevClosedDate: Date = this.prematureCloseAccountForm.value.closedOnDate;
    this.prematureCloseAccountForm.patchValue({
      closedOnDate: this.datePipe.transform(prevClosedDate, dateFormat),
    });
    const data = {
      ...this.prematureCloseAccountForm.value,
      dateFormat,
      locale
    };
    this.fixedDepositsService.executeFixedDepositsAccountCommand(this.accountId, 'prematureClose', data).subscribe(() => {
      this.router.navigate(['../../'], { relativeTo: this.route });
    });
  }

}
