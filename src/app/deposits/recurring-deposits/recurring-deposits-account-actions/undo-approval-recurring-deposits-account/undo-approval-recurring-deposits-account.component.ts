/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

/** Custom Services */
import { RecurringDepositsService } from '../../recurring-deposits.service';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Undo Approval Recurring Deposits Account Component
 */
@Component({
  selector: 'mifosx-undo-approval-recurring-deposits-account',
  templateUrl: './undo-approval-recurring-deposits-account.component.html',
  styleUrls: ['./undo-approval-recurring-deposits-account.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    CdkTextareaAutosize
  ]
})
export class UndoApprovalRecurringDepositsAccountComponent implements OnInit {
  /** Undo Approval Recurring Deposits Account form. */
  undoApprovalRecurringDepositsAccountForm: UntypedFormGroup;
  /** Recurring Deposits Account Id */
  accountId: any;
  /** Action to be Undo */
  undoAction: string;
  undoCommand: string;

  /**
   * @param {FormBuilder} formBuilder Form Builder
   * @param {SavingsService} recurringDepositsService Recurring Deposits Service
   * @param {ActivatedRoute} route Activated Route
   * @param {Router} router Router
   */
  constructor(
    private formBuilder: UntypedFormBuilder,
    private recurringDepositsService: RecurringDepositsService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.undoCommand = 'undoapproval'; // Default command
    this.undoAction = this.route.snapshot.params['name'];
    if (this.undoAction === 'Undo Activation') {
      this.undoCommand = 'undoactivate';
    }
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
      note: ['']
    });
  }

  /**
   * Submits the form and undo the approval of recurring deposits account,
   * if successful redirects to the recurring deposits account.
   */
  submit() {
    const data = {
      ...this.undoApprovalRecurringDepositsAccountForm.value
    };
    if (this.undoAction === 'Undo Activation') {
      this.recurringDepositsService
        .executeRecurringDepositsAccountCommand(this.accountId, this.undoCommand, data)
        .subscribe(() => {
          this.router.navigate(['../../'], { relativeTo: this.route });
        });
    } else {
      this.recurringDepositsService
        .executeRecurringDepositsAccountCommand(this.accountId, 'undoapproval', data)
        .subscribe(() => {
          this.router.navigate(['../../'], { relativeTo: this.route });
        });
    }
  }
}
