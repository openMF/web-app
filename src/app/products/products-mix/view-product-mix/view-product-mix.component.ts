/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
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
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';

/** Custom Services */
import { TranslateService } from '@ngx-translate/core';
import { ProductsService } from 'app/products/products.service';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { NgClass } from '@angular/common';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * View product mix component.
 */
@Component({
  selector: 'mifosx-view-product-mix',
  templateUrl: './view-product-mix.component.html',
  styleUrls: ['./view-product-mix.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent,
    MatTable,
    MatSort,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatSortHeader,
    NgClass,
    MatCellDef,
    MatCell,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatPaginator
  ]
})
export class ViewProductMixComponent implements OnInit {
  /** Product mix data. */
  productMixData: any;
  /** Allowed products datasource. */
  allowedProductsDatasource: MatTableDataSource<any>;
  /** Restricted products datasource. */
  restrictedProductsDatasource: MatTableDataSource<any>;
  /** Columns to be displayed in allowed products table. */
  allowedProductsDisplayedColumns: string[] = ['name'];
  /** Columns to be displayed in restricted products table. */
  restrictedProductsDisplayedColumns: string[] = ['name'];

  /** Paginator for allowed products table. */
  @ViewChild('allowed', { static: true }) allowedPaginator: MatPaginator;
  /** Paginator for restricted products table. */
  @ViewChild('restricted', { static: true }) restrictedPaginator: MatPaginator;
  /** Sorter for allowed products table. */
  @ViewChild(MatSort, { static: true }) allowedSort: MatSort;
  /** Sorter for restricted products table. */
  @ViewChild(MatSort, { static: true }) restrictedSort: MatSort;

  /**
   * Retrieves the product mix data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   * @param {TranslateService} translateService Translate Service.
   */
  constructor(
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private productsService: ProductsService,
    private router: Router,
    private translateService: TranslateService
  ) {
    this.route.data.subscribe((data: { productMix: any }) => {
      this.productMixData = data.productMix;
    });
  }

  /**
   * Sets the allowed and restricted products tables.
   */
  ngOnInit() {
    this.setAllowedProducts();
    this.setRestrictedProducts();
  }

  /**
   * Initializes the data source, paginator and sorter for the allowed products table.
   */
  setAllowedProducts() {
    this.allowedProductsDatasource = new MatTableDataSource(this.productMixData.allowedProducts);
    this.allowedProductsDatasource.paginator = this.allowedPaginator;
    this.allowedProductsDatasource.sort = this.allowedSort;
  }

  /**
   * Initializes the data source, paginator and sorter for the restricted products table.
   */
  setRestrictedProducts() {
    this.restrictedProductsDatasource = new MatTableDataSource(this.productMixData.restrictedProducts);
    this.restrictedProductsDatasource.paginator = this.restrictedPaginator;
    this.restrictedProductsDatasource.sort = this.restrictedSort;
  }

  /**
   * Deletes the product mix
   */
  delete() {
    const deleteProductMixDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: {
        deleteContext:
          this.translateService.instant('labels.dialogContext.the productmix component with id') +
          ' ' +
          this.productMixData.productId
      }
    });
    deleteProductMixDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.productsService.deleteProductMix(this.productMixData.productId).subscribe(() => {
          this.router.navigate(['../'], { relativeTo: this.route });
        });
      }
    });
  }
}
