import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ExternalAssetOwnerService } from 'app/loans/external-asset-owner.service';
import { CancelDialogComponent } from 'app/shared/cancel-dialog/cancel-dialog.component';

@Component({
  selector: 'mifosx-external-asset-owner-tab',
  templateUrl: './external-asset-owner-tab.component.html',
  styleUrls: ['./external-asset-owner-tab.component.scss']
})
export class ExternalAssetOwnerTabComponent implements OnInit {

  defaultDate = '9999-12-31';
  loanTransfersData: any[] = [];
  activeTransferData: any;
  loanTransferColumns: string[] = ['status', 'effectiveFrom', 'ownerExternalId', 'transferExternalId', 'settlementDate', 'purchasePriceRatio', 'actions'];

  currentItem: any;
  existActiveTransfer = false;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private externalAssetOwnerService: ExternalAssetOwnerService
    ) {
    this.route.data.subscribe((data: { loanTransfersData: any, activeTransferData: any }) => {
      this.loanTransfersData =  data.loanTransfersData.empty ? [] : data.loanTransfersData.content;
      this.activeTransferData = data.activeTransferData || null;
      this.existActiveTransfer = (data.activeTransferData && data.activeTransferData.transferId != null);
    });
  }

  ngOnInit(): void {
    this.currentItem = null;
    if (this.loanTransfersData.length > 0) {
      this.currentItem = this.loanTransfersData[(this.loanTransfersData.length - 1)];
    }
  }

  itemCurrentStatus(item: any): string {
    if (this.isBuyBackPending(item)) {
      return item.status + ' PENDING';
    }
    return item.status;
  }

  itemStatus(status: string): string {
    return 'status-' + status.toLowerCase();
  }

  isPending(item: any): boolean {
    return (item.status === 'PENDING');
  }

  isPendingOrCanceled(item: any): boolean {
    return ((item.status === 'PENDING') || (item.status === 'CANCELLED') || this.isBuyBackPending(item));
  }

  isBuyBackPending(item: any): boolean {
    return (item.status === 'BUYBACK' && item.effectiveTo === this.defaultDate);
  }

  canBeCancelled(): boolean {
    return this.validateStatus('PENDING');
  }

  canBeSaled(): boolean {
    if (this.currentItem == null) {
      return true;
    }
    return ['', 'CANCELLED'].includes(this.currentItem.status) || (this.currentItem.status === 'BUYBACK' && this.currentItem.effectiveTo !== this.defaultDate);
  }

  canBeBuyed(): boolean {
    return this.validateStatus('ACTIVE');
  }

  private validateStatus(status: string): boolean {
    if (this.currentItem != null) {
      return (this.currentItem.status === status);
    }
    return false;
  }

  saleLoan(): void {
    this.router.navigate(['../actions/Sale Loan'], { relativeTo: this.route });
  }

  cancelSaleLoan(): void {
    const deleteDataTableDialogRef = this.dialog.open(CancelDialogComponent, {
      data: { cancelContext: `the Asset Transfer with the Owner External Id ${this.currentItem.owner.externalId} ` }
    });
    deleteDataTableDialogRef.afterClosed().subscribe((response: any) => {
      if (response.cancel) {
        const payload: any = {
          transferExternalId: this.currentItem.transferExternalId
        };
        this.externalAssetOwnerService.executeExternalAssetOwnerTransferCommand(this.currentItem.transferId, payload, 'cancel')
          .subscribe((result: any) => {
            this.reload();
        });
      }
    });
  }

  buyBackLoan(): void {
    this.router.navigate(['../actions/Buy Back Loan'], { relativeTo: this.route });
  }

  routeJournalEntry(ev: MouseEvent): void {
    ev.stopPropagation();
  }

  reload() {
    const url: string = this.router.url;
    this.router.navigateByUrl(`/`, {skipLocationChange: true})
      .then(() => this.router.navigate([url]));
  }
}
