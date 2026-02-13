/** Angular Imports */
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

/** Custom Services */
import { ShareAccountService } from '@fineract/client';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Undo Approval Shares Account Component
 */
@Component({
  selector: 'mifosx-undo-approval-shares-account',
  templateUrl: './undo-approval-shares-account.component.html',
  styleUrls: ['./undo-approval-shares-account.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FormsModule
  ]
})
export class UndoApprovalSharesAccountComponent {
  /** Shares Account Id */
  accountId: any;

  /**
   * @param {ShareAccountService } ShareAccountService Shares Account Service
   * @param {ActivatedRoute} route Activated Route
   * @param {Router} router Router
   */
  constructor(
    private shareAccountService: ShareAccountService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.accountId = this.route.parent.snapshot.params['shareAccountId'];
  }

  /**
   * Submits the form and undo the approval of share account,
   * if successful redirects to the share account.
   */
  submit() {
    this.shareAccountService
      .handleCommands2({
        type: 'shares',
        accountId: this.accountId,
        postAccountsTypeAccountIdRequest: {},
        command: 'undoapproval'
      })
      .subscribe(() => {
        this.router.navigate(['../../'], { relativeTo: this.route });
      });
  }
}
