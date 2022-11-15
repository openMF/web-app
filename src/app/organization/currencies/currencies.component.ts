/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { DisableDialogComponent } from 'app/shared/disable-dialog/disable-dialog.component';
import { MatDialog } from '@angular/material/dialog';

/** rxjs Imports */
import { of } from 'rxjs';
import { OrganizationService } from '../organization.service';
import { EnableDialogComponent } from 'app/shared/enable-dialog/enable-dialog.component';

/**
 * Currencies component.
 */
@Component({
  selector: 'mifosx-currencies',
  templateUrl: './currencies.component.html',
  styleUrls: ['./currencies.component.scss']
})
export class CurrenciesComponent implements OnInit {

  /** Currencies data. */
  currenciesData: any;
  /** Columns to be displayed in currencies table. */
  displayedColumns: string[] = ['name', 'code', 'country', 'actions'];
  /** Data source for currencies table. */
  dataSource: MatTableDataSource<any>;

  /** Paginator for currencies table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter for currencies table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  /**
   * Retrieves the currencies data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute, private dialog: MatDialog,
    private organizationService: OrganizationService, private router: Router ) {
    this.route.data.subscribe(( data: { currencies: any }) => {
      this.currenciesData = data.currencies.selectedCurrencyOptions;
    });
  }

  /**
   * Filters data in currencies table based on passed value.
   * @param {string} filterValue Value to filter data.
   */
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * Sets the currencies table.
   */
  ngOnInit() {
    this.setCurrencies();
  }

  /**
   * Initializes the data source, paginator and sorter for currencies table.
   */
  setCurrencies() {
    this.dataSource = new MatTableDataSource(this.currenciesData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  deactivateCurrency(currencyId: any, status: boolean, currencyCode: any) {
    const currency = this.currenciesData.filter(x => x.currencyId === currencyId);
    console.log(currency);
    if (!status) {
    const disableOutletDialogRef = this.dialog.open(DisableDialogComponent, {
      data: { disableContext: currency[0]?.name }
    });
    disableOutletDialogRef.afterClosed().subscribe((response: any) => {
      if (response.disable) {
        this.organizationService.deactivatCurrency(currencyId, status).subscribe(() => {
          this.router.navigate(['../'], { relativeTo: this.route });
        });
      }
    });
  } else {
    const enableletDialogRef = this.dialog.open(EnableDialogComponent, {
      data: { enableContext: currency[0]?.name }
    });
    enableletDialogRef.afterClosed().subscribe((response: any) => {
      if (response.enable) {
        this.organizationService.deactivatCurrency(currencyId, status).subscribe(() => {
          this.router.navigate(['../'], { relativeTo: this.route });
        });
      }
    });
  }
  }

}
