/** Angular Imports */
import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { MatDialog, MatTable } from '@angular/material';

/** Custom Dialogs */
import { ApproveShareDialogComponent } from './approve-share-dialog/approve-share-dialog.component';

/** Custom Serices */
import { SharesService } from 'app/shares/shares.service';

/**
 * Approve shares component.
 */
@Component({
  selector: 'mifosx-approve-shares',
  templateUrl: './approve-shares.component.html',
  styleUrls: ['./approve-shares.component.scss']
})
export class ApproveSharesComponent implements OnInit {

  /** Shares account data. */
  @Input() sharesAccountData: any;

  /** Shares account Id */
  accountId: any;
  /** Shares account data. */
  sharesData: any[];
  /** Columns to be displayed in shares table. */
  displayedColumns: string[] = ['transactionDate', 'totalShares', 'redeemedPrice', 'status', 'approve'];
  /** Data source for shares table. */
  dataSource: MatTableDataSource<any>;

  /** Paginator for shares table. */
  @ViewChild(MatPaginator) paginator: MatPaginator;
  /** Sorter for shares table. */
  @ViewChild(MatSort) sort: MatSort;
  /** Shares table reference */
  @ViewChild('sharesTable') sharesTableRef: MatTable<Element>;

  /**
   * @param {SharesService} sharesService Shares Service
   */
  constructor(private sharesService: SharesService,
              private route: ActivatedRoute,
              public dialog: MatDialog) {
    this.accountId = this.route.parent.snapshot.params['shareAccountId'];
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
   * Approves a share
   * @param {any} id Share Id
   */
  approve(id: any) {
    const approveSharesDialogRef = this.dialog.open(ApproveShareDialogComponent, {
      data: { shareId: id }
    });
    approveSharesDialogRef.afterClosed().subscribe((response: any) => {
      if (response.approve) {
        const locale = 'en';
        const dateFormat = 'dd MMMM yyyy';
        const data = {
          requestedShares: [{id}],
          dateFormat,
          locale
        };
        this.sharesService.executeSharesAccountCommand(this.accountId, 'approveadditionalshares', data).subscribe(() => {
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
