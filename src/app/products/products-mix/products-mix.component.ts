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

/** rxjs Imports */
import { of } from 'rxjs';
import { HasPermissionDirective } from '../../directives/has-permission/has-permission.directive';
import { MatButton } from '@angular/material/button';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';

/**
 * Products Mix component.
 */
@Component({
  selector: 'mifosx-products-mix',
  templateUrl: './products-mix.component.html',
  styleUrls: ['./products-mix.component.scss'],
  imports: [
    HasPermissionDirective,
    MatButton,
    RouterLink,
    FaIconComponent,
    MatFormField,
    MatLabel,
    MatInput,
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
    TranslatePipe,
    NgxTranslatePipe
  ]
})
export class ProductsMixComponent implements OnInit {
  /** productMix data. */
  productMixData: any;
  /** Columns to be displayed in products mix table. */
  displayedColumns: string[] = ['productName'];
  /** Data source for products mix table. */
  dataSource: MatTableDataSource<any>;
  /** Paginator for manage data tables table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter for manage data tables table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  /**
   * Retrieves the products data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe((data: { products: any }) => {
      this.productMixData = data.products;
    });
  }

  /**
   * Filters data in products mix table based on passed value.
   * @param {string} filterValue Value to filter data.
   */
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * Sets the products mix table.
   */
  ngOnInit() {
    this.setProductsMix();
  }

  /**
   * Initializes the data source, paginator and sorter for products mix table.
   */
  setProductsMix() {
    this.dataSource = new MatTableDataSource(this.productMixData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
}
