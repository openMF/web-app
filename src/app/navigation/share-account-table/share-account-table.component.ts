/** Angular Imports */
import { Component, Input, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import {
  MatTableDataSource,
  MatTable,
  MatColumnDef,
  MatHeaderCellDef,
  MatHeaderCell,
  MatCellDef,
  MatCell,
  MatHeaderRowDef,
  MatHeaderRow,
  MatRowDef,
  MatRow
} from '@angular/material/table';

/** Custom Pipes */
import { AccountsFilterPipe } from '../../pipes/accounts-filter.pipe';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatTooltip } from '@angular/material/tooltip';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';
import { StatusLookupPipe } from '../../pipes/status-lookup.pipe';

@Component({
  selector: 'mifosx-share-account-table',
  templateUrl: './share-account-table.component.html',
  styleUrls: ['./share-account-table.component.scss'],
  imports: [
    MatFormField,
    MatLabel,
    MatInput,
    MatButton,
    MatTable,
    MatSort,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatSortHeader,
    MatCellDef,
    MatCell,
    FaIconComponent,
    MatTooltip,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatPaginator,
    TranslatePipe,
    StatusLookupPipe,
    NgxTranslatePipe
  ]
})
export class ShareAccountTableComponent {
  /** Columns to be displayed in the share accounts table. */
  displayedColumns: string[] = [
    'accountNo',
    'productName',
    'totalApprovedShares',
    'Status'
  ];
  /** Show closed share accounts */
  showClosed = false;
  /** Data source for share account table. */
  dataSource: MatTableDataSource<any>;
  /** Share Account Data */
  accountData: any;

  /** Paginator for share account table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter for share account table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  /** Share Account Setter */
  @Input() set shareAccountData(data: any) {
    this.accountData = data;
    const filteredAccountData = this.accountsFilterPipe.transform(
      data,
      'share',
      this.showClosed ? 'closed' : 'open',
      'isShare'
    );
    this.dataSource = new MatTableDataSource(filteredAccountData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  /**
   * @param {AccountsFilterPipe} accountsFilterPipe Accounts Filter Pipe.
   */
  constructor(private accountsFilterPipe: AccountsFilterPipe) {}

  /**
   * Filters data in users table based on passed value.
   * @param {string} filterValue Value to filter data.
   */
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * Toggles the share status
   */
  toggleClosed() {
    this.showClosed = !this.showClosed;
    const filteredAccountData = this.accountsFilterPipe.transform(
      this.accountData,
      'share',
      this.showClosed ? 'closed' : 'open',
      'isShare'
    );
    this.dataSource = new MatTableDataSource(filteredAccountData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
}
