/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';

/** Custom Services */
import { ProductsService } from 'app/products/products.service';

/**
 * View product mix component.
 */
@Component({
  selector: 'mifosx-view-product-mix',
  templateUrl: './view-product-mix.component.html',
  styleUrls: ['./view-product-mix.component.scss']
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
   */
  constructor(private route: ActivatedRoute,
              private dialog: MatDialog,
              private productsService: ProductsService,
              private router: Router ) {
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
      data: { deleteContext: `the productmix component with id ${this.productMixData.productId}` }
    });
    deleteProductMixDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.productsService.deleteProductMix(this.productMixData.productId)
          .subscribe(() => {
            this.router.navigate(['../'], { relativeTo: this.route });
          });
      }
    });
  }
}
