/** Angular Imports */
import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'mifosx-view-account-transfer',
  templateUrl: './view-account-transfer.component.html',
  styleUrls: ['./view-account-transfer.component.scss']
})
export class ViewAccountTransferComponent implements OnDestroy {

  viewAccountTransferData: any;
  fromAccountUrl: string | null = null;
  toAccountUrl: string | null = null;
  private readonly destroy$ = new Subject<void>();

  /**
   * Retrieves the view account transfer data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute) {
    this.route.data
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: { viewAccountTransferData: any }) => {
        this.viewAccountTransferData = data.viewAccountTransferData;
        const { fromAccountType, fromClient, fromAccount, toAccountType, toClient, toAccount } = data.viewAccountTransferData;
        this.fromAccountUrl = this.getAccountUrl(fromAccountType.code, fromClient.id, fromAccount.id);
        this.toAccountUrl = this.getAccountUrl(toAccountType.code, toClient.id, toAccount.id);
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

}
