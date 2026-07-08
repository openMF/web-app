/** Angular Imports */
import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'mifosx-view-account-transfer',
  templateUrl: './view-account-transfer.component.html',
  styleUrls: ['./view-account-transfer.component.scss']
})
export class ViewAccountTransferComponent implements OnDestroy {

  viewAccountTransferData: any;
  private readonly destroy$ = new Subject<void>();
  /**
   * Retrieves the view account transfer data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute, private router: Router) {
    this.route.data
    .pipe(takeUntil(this.destroy$))
    .subscribe((data: { viewAccountTransferData: any }) => {
      this.viewAccountTransferData = data.viewAccountTransferData;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

    private getAccountUrl(accountTypeCode: string, clientId: string, accountId: string): string | null {
    const base = `/clients/${clientId}`;
    if (accountTypeCode === 'accountType.loan') {
      return `${base}/loans-accounts/${accountId}/general`;
    }
    if (accountTypeCode === 'accountType.savings') {
      return `${base}/savings-accounts/${accountId}/transactions`;
    }
    return null;
  }

  private navigateToAccount(accountTypeCode: string, clientId: string, accountId: string): void {
    const url = this.getAccountUrl(accountTypeCode, clientId, accountId);
    if (url) {
      this.router.navigateByUrl(url);
    } else {
      console.warn(`Unsupported account type: ${accountTypeCode}`);
    }
  }

  navigationURLToAccountFromOnViewTransferData(): void {
    const { fromAccountType, fromClient, fromAccount } = this.viewAccountTransferData ?? {};
    if (fromAccountType && fromClient && fromAccount) {
      this.navigateToAccount(fromAccountType.code, fromClient.id, fromAccount.id);
    }
  }

  navigationURLToAccountToOnViewTransferData(): void {
    const { toAccountType, toClient, toAccount } = this.viewAccountTransferData ?? {};
    if (toAccountType && toClient && toAccount) {
      this.navigateToAccount(toAccountType.code, toClient.id, toAccount.id);
    }
  }

}
