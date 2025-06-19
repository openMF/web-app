/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
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
import { ActivatedRoute, RouterLink } from '@angular/router';
import { UntypedFormControl, ReactiveFormsModule } from '@angular/forms';

/** Custom Services */
import { OrganizationService } from 'app/organization/organization.service';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { DateFormatPipe } from '../../../../pipes/date-format.pipe';
import { FormatNumberPipe } from '../../../../pipes/format-number.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Cashier Transactions Component.
 */
@Component({
  selector: 'mifosx-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent,
    MatTable,
    MatSort,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatSortHeader,
    MatCellDef,
    MatCell,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatPaginator,
    DateFormatPipe,
    FormatNumberPipe
  ]
})
export class TransactionsComponent implements OnInit {
  /** Currency selector. */
  currencySelector = new UntypedFormControl();
  /** Cashier Id */
  cashierId: any;
  /** Teller Id */
  tellerId: any;
  /** Cashier data. */
  cashierData: any;
  /** Currencys data. */
  currencyData: any;
  /** Columns to be displayed in transactions table. */
  displayedColumns: string[] = [
    'date',
    'transactions',
    'allocation',
    'cashIn',
    'cashOut',
    'settlement'
  ];
  /** Data source for transactions table. */
  dataSource: MatTableDataSource<any>;

  /** Paginator for transactions table. */
  @ViewChild(MatPaginator) paginator: MatPaginator;
  /** Sorter for transactions table. */
  @ViewChild(MatSort) sort: MatSort;

  /**
   * Retrieves the currencies data from `resolve`.
   * @param {OrganizationService} organizationService Organization Service.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(
    private organizationService: OrganizationService,
    private route: ActivatedRoute
  ) {
    this.route.data.subscribe((data: { currencies: any }) => {
      this.currencyData = data.currencies.selectedCurrencyOptions;
    });
    this.tellerId = this.route.parent.parent.parent.snapshot.params['id'];
    this.cashierId = this.route.parent.snapshot.params['id'];
  }

  /**
   * Filters data in transactions table based on passed value.
   * @param {string} filterValue Value to filter data.
   */
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * Retrieves transactions data on changing currency.
   */
  ngOnInit() {
    this.onChangeCurrency();
  }

  /**
   * Retrieves the transactions data on changing currency and sets the transactions table.
   */
  onChangeCurrency() {
    this.currencySelector.valueChanges.subscribe((currencyCode: any) => {
      this.organizationService
        .getCashierSummaryAndTransactions(this.tellerId, this.cashierId, currencyCode)
        .subscribe((response: any) => {
          this.cashierData = response;
          this.setTransactions();
        });
    });
  }

  /**
   * Initializes the data source, paginator and sorter for transactions table.
   */
  setTransactions() {
    this.dataSource = new MatTableDataSource(this.cashierData.cashierTransactions.pageItems);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
}
