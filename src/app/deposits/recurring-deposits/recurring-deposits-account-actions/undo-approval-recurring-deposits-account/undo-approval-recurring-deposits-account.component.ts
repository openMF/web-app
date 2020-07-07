/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { RecurringDepositsService } from '../../recurring-deposits.service';

/**
 * Undo Approval Recurring Deposits Account Component
 */
@Component({
  selector: 'mifosx-undo-approval-recurring-deposits-account',
  templateUrl: './undo-approval-recurring-deposits-account.component.html',
  styleUrls: ['./undo-approval-recurring-deposits-account.component.scss']
})
export class UndoApprovalRecurringDepositsAccountComponent implements OnInit {

  /** Undo Approval Recurring Deposits Account form. */
  undoApprovalRecurringDepositsAccountForm: FormGroup;
  /** Recurring Deposits Account Id */
  accountId: any;

  /**
   * @param {FormBuilder} formBuilder Form Builder
   * @param {SavingsService} recurringDepositsService Recurring Deposits Service
   * @param {ActivatedRoute} route Activated Route
   * @param {Router} router Router
   */
  constructor(private formBuilder: FormBuilder,
    private recurringDepositsService: RecurringDepositsService,
    private route: ActivatedRoute,
    private router: Router) {
    this.accountId = this.route.parent.snapshot.params['recurringDepositAccountId'];
  }

  /**
   * Creates the undo-approval recurring deposits form.
   */
  ngOnInit() {
    this.createUndoApprovalRecurringDepositsAccountForm();
  }

  /**
   * Creates the undo-approval recurring deposits account form.
   */
  createUndoApprovalRecurringDepositsAccountForm() {
    this.undoApprovalRecurringDepositsAccountForm = this.formBuilder.group({
      'note': ['']
    });
  }

  /**
   * Submits the form and undo the approval of recurring deposits account,
   * if successful redirects to the recurring deposits account.
   */
  submit() {
    const data = {
      ...this.undoApprovalRecurringDepositsAccountForm.value,
    };
    this.recurringDepositsService.executeRecurringDepositsAccountCommand(this.accountId, 'undoapproval', data).subscribe(() => {
      this.router.navigate(['../../'], { relativeTo: this.route });
    });
  }

}
