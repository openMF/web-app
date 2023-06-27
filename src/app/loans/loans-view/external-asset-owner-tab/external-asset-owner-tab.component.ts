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
      console.log(this.existActiveTransfer);
      console.log(this.activeTransferData);
    });
  }

  ngOnInit(): void {
    this.currentItem = null;
    if (this.loanTransfersData.length > 0) {
      this.currentItem = this.loanTransfersData[(this.loanTransfersData.length - 1)];
    }
  }

  itemCurrentStatus(item: any): string {
    if (item.status === 'BUYBACK' && item.effectiveTo === '9999-12-31') {
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

  canBeCancelled(): boolean {
    return this.validateStatus('PENDING');
  }

  canBeSaled(): boolean {
    if (this.currentItem == null) {
      return true;
    }
    return ['', 'BUYBACK'].includes(this.currentItem.status);
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
        this.externalAssetOwnerService.executeExternalAssetOwnerLoanCommand(this.currentItem.loan.loanId, payload, 'cancel')
          .subscribe((result: any) => {
            console.log(result);
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

}
