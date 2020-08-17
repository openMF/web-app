/** Angular Imports */
import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatTable } from '@angular/material/table';

/** Custom Dialogs */
import { RejectShareDialogComponent } from './reject-share-dialog/reject-share-dialog.component';

/** Custom Serices */
import { SharesService } from 'app/shares/shares.service';

/**
 * Reject shares component.
 */
@Component({
  selector: 'mifosx-reject-shares',
  templateUrl: './reject-shares.component.html',
  styleUrls: ['./reject-shares.component.scss']
})
export class RejectSharesComponent implements OnInit {

  /** Shares account data. */
  sharesAccountData: any;

  /** Shares account Id */
  accountId: any;
  /** Shares account data. */
  sharesData: any[];
  /** Columns to be displayed in shares table. */
  displayedColumns: string[] = ['transactionDate', 'totalShares', 'redeemedPrice', 'status', 'reject'];
  /** Data source for shares table. */
  dataSource: MatTableDataSource<any>;

  /** Paginator for shares table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter for shares table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  /** Shares table reference */
  @ViewChild('sharesTable', { static: true }) sharesTableRef: MatTable<Element>;

  /**
   * @param {SharesService} sharesService Shares Service
   * @param {ActivatedRoute} route Activated Route
   * @param {MatDialog} dialog Mat Dialog
   */
  constructor(private sharesService: SharesService,
              private route: ActivatedRoute,
              public dialog: MatDialog) {
    this.accountId = this.route.parent.snapshot.params['shareAccountId'];
    this.route.data.subscribe((data: { shareAccountActionData: any }) => {
      this.sharesAccountData = data.shareAccountActionData;
    });
  }

  /**
   * Sets the shares table.
   */
  ngOnInit() {
    this.sharesData = this.sharesAccountData.purchasedShares
    .filter((share: any) => share.status.value === 'Pending Approval');
    this.setShares();
  }

  /**
   * Initializes the data source, paginator and sorter for shares table.
   */
  setShares() {
    this.dataSource = new MatTableDataSource(this.sharesData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  /**
   * Rejects a share
   * @param {any} id Share Id
   */
  reject(id: any) {
    const rejectSharesDialogRef = this.dialog.open(RejectShareDialogComponent, {
      data: { shareId: id }
    });
    rejectSharesDialogRef.afterClosed().subscribe((response: any) => {
      if (response.reject) {
        const locale = 'en';
        const dateFormat = 'dd MMMM yyyy';
        const data = {
          requestedShares: [{id}],
          dateFormat,
          locale
        };
        this.sharesService.executeSharesAccountCommand(this.accountId, 'rejectadditionalshares', data).subscribe(() => {
          const share = this.sharesData.find(element => element.id === id);
          const index = this.sharesData.indexOf(share);
          this.sharesData.splice(index, 1);
          this.dataSource.data = this.sharesData;
          this.sharesTableRef.renderRows();
        });
      }
    });
  }

}
