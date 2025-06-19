/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

/** Custom Services */
import { SavingsService } from 'app/savings/savings.service';
import { FixedDepositsService } from '../../fixed-deposits.service';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Undo Approval Fixed Deposits Account Component
 */
@Component({
  selector: 'mifosx-undo-approval-fixed-deposits-account',
  templateUrl: './undo-approval-fixed-deposits-account.component.html',
  styleUrls: ['./undo-approval-fixed-deposits-account.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    CdkTextareaAutosize
  ]
})
export class UndoApprovalFixedDepositsAccountComponent implements OnInit {
  /** Undo Approval Fixed Deposits Account form. */
  undoApprovalFixedDepositsAccountForm: UntypedFormGroup;
  /** Fixed Deposits Account Id */
  accountId: any;
  /** Action to be Undo */
  undoAction: string;
  undoCommand: string;

  /**
   * Fixed deposits endpoint is not supported so using Savings endpoint.
   * @param {FormBuilder} formBuilder Form Builder
   * @param {SavingsService} savingsService Savings Service
   * @param {ActivatedRoute} route Activated Route
   * @param {Router} router Router
   */
  constructor(
    private formBuilder: UntypedFormBuilder,
    private savingsService: SavingsService,
    private fixedDepositsService: FixedDepositsService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.undoCommand = 'undoapproval'; // Default command
    this.undoAction = this.route.snapshot.params['name'];
    if (this.undoAction === 'Undo Activation') {
      this.undoCommand = 'undoactivate';
    }
    this.accountId = this.route.parent.snapshot.params['fixedDepositAccountId'];
  }

  /**
   * Creates the undo-approval fixed deposits form.
   */
  ngOnInit() {
    this.createUndoApprovalFixedDepositsAccountForm();
  }

  /**
   * Creates the undo-approval fixed deposits account form.
   */
  createUndoApprovalFixedDepositsAccountForm() {
    this.undoApprovalFixedDepositsAccountForm = this.formBuilder.group({
      note: ['']
    });
  }

  /**
   * Submits the form and undo the approval of fixed deposits account,
   * if successful redirects to the share account.
   */
  submit() {
    const data = {
      ...this.undoApprovalFixedDepositsAccountForm.value
    };
    if (this.undoAction === 'Undo Activation') {
      this.fixedDepositsService
        .executeFixedDepositsAccountCommand(this.accountId, this.undoCommand, data)
        .subscribe(() => {
          this.router.navigate(['../../'], { relativeTo: this.route });
        });
    } else {
      this.savingsService.executeSavingsAccountCommand(this.accountId, this.undoCommand, data).subscribe(() => {
        this.router.navigate(['../../'], { relativeTo: this.route });
      });
    }
  }
}
