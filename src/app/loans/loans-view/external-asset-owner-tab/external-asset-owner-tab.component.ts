import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ExternalAssetOwner } from 'app/loans/services/external-asset-owner';
import { ExternalAssetOwnerService } from 'app/loans/services/external-asset-owner.service';
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
    private externalAssetOwner: ExternalAssetOwner,
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
    return this.externalAssetOwner.itemCurrentStatus(item);
  }

  itemStatus(status: string): string {
    return this.externalAssetOwner.itemStatus(status);
  }

  isPending(item: any): boolean {
    return this.externalAssetOwner.isPending(item);
  }

  isPendingOrCanceled(item: any): boolean {
    return this.externalAssetOwner.isPendingOrCanceled(item);
  }

  isBuyBackPending(item: any): boolean {
    return this.externalAssetOwner.isBuyBackPending(item);
  }

  canBeCancelled(): boolean {
    return this.externalAssetOwner.validateStatus(this.currentItem, 'PENDING');
  }

  canBeSold(): boolean {
    return this.externalAssetOwner.canBeSold(this.currentItem);
  }

  canBeBuyed(): boolean {
    return this.externalAssetOwner.validateStatus(this.currentItem, 'ACTIVE');
  }

  saleLoan(): void {
    this.router.navigate(['../actions/Sell Loan'], { relativeTo: this.route });
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
