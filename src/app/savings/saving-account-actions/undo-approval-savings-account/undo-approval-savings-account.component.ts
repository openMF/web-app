/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { SavingsService } from 'app/savings/savings.service';

/**
 * Undo Approval Savings Account Component
 */
@Component({
  selector: 'mifosx-undo-approval-savings-account',
  templateUrl: './undo-approval-savings-account.component.html',
  styleUrls: ['./undo-approval-savings-account.component.scss']
})
export class UndoApprovalSavingsAccountComponent implements OnInit {

  /** Undo Approval Savings Account form. */
  undoApprovalSavingsAccountForm: FormGroup;
  /** Savings Account Id */
  accountId: any;

  /**
   * @param {FormBuilder} formBuilder Form Builder
   * @param {SavingsService} savingsService Savings Service
   * @param {ActivatedRoute} route Activated Route
   * @param {Router} router Router
   */
  constructor(private formBuilder: FormBuilder,
              private savingsService: SavingsService,
              private route: ActivatedRoute,
              private router: Router) {
    this.accountId = this.route.parent.snapshot.params['savingAccountId'];
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
      'note': ['']
    });
  }

  /**
   * Submits the form and undo the approval of share account,
   * if successful redirects to the share account.
   */
  submit() {
    const data = {
      ...this.undoApprovalSavingsAccountForm.value,
    };
    this.savingsService.executeSavingsAccountCommand(this.accountId, 'undoapproval', data).subscribe(() => {
      this.router.navigate(['../../'], { relativeTo: this.route });
    });
  }

}
