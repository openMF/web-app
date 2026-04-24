/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

/** Custom Services */
import { SavingsAccountService } from '@fineract/client';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Undo Approval Savings Account Component
 */
@Component({
  selector: 'mifosx-undo-approval-savings-account',
  templateUrl: './undo-approval-savings-account.component.html',
  styleUrls: ['./undo-approval-savings-account.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    CdkTextareaAutosize
  ]
})
export class UndoApprovalSavingsAccountComponent implements OnInit {
  /** Undo Approval Savings Account form. */
  undoApprovalSavingsAccountForm: UntypedFormGroup;
  /** Savings Account Id */
  accountId: any;

  /**
   * @param {FormBuilder} formBuilder Form Builder
   * @param {SavingsAccountService} savingsAccountService Savings Account Service
   * @param {ActivatedRoute} route Activated Route
   * @param {Router} router Router
   */
  constructor(
    private formBuilder: UntypedFormBuilder,
    private savingsAccountService: SavingsAccountService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.accountId = this.route.snapshot.params['savingAccountId'];
  }

  /**
   * Creates the undo-approval savings form.
   */
  ngOnInit() {
    this.createUndoApprovalSavingsAccountForm();
  }

  /**
   * Creates the undo-approval savings account form.
   */
  createUndoApprovalSavingsAccountForm() {
    this.undoApprovalSavingsAccountForm = this.formBuilder.group({
      note: ['']
    });
  }

  /**
   * Submits the form and undo the approval of share account,
   * if successful redirects to the share account.
   */
  submit() {
    const data = {
      ...this.undoApprovalSavingsAccountForm.value
    };
    this.savingsAccountService
      .handleCommands6({
        accountId: this.accountId,
        command: 'undoapproval',
        postSavingsAccountsAccountIdRequest: data
      })
      .subscribe(() => {
        this.router.navigate(['../../transactions'], { relativeTo: this.route });
      });
  }
}
