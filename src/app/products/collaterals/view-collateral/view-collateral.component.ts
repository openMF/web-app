import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

/** Custom Services */
import { ProductsService } from 'app/products/products.service';

/** Custom Components */
import { DeleteDialogComponent } from '../../../shared/delete-dialog/delete-dialog.component';

/**
 * View Collateral Component
 */
@Component({
  selector: 'mifosx-view-collateral',
  templateUrl: './view-collateral.component.html',
  styleUrls: ['./view-collateral.component.scss']
})
export class ViewCollateralComponent implements OnInit {

  /** Collateral Data */
  collateralData: any;

  /**
   * Retrieves the Collateral Data from 'resolve.
   * @param {ProductsService} productsService Products Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {MatDialog} dialog Dialog reference.
   */
  constructor(private productsService: ProductsService,
              private route: ActivatedRoute,
              private router: Router,
              private dialog: MatDialog) {
                this.route.data.subscribe((data: { collateral: any }) => {
                    this.collateralData = data.collateral;
                });
               }

  ngOnInit(): void {
  }

  /**
   * Deletes the collateral and redirects to collaterals
   */
  deleteCollateral() {
    const deleteCollateralDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `collateral ${this.collateralData.id}` }
    });
    deleteCollateralDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.productsService.deleteCollateral(this.collateralData.id)
          .subscribe(() => {
            this.router.navigate(['/products/collaterals']);
          });
      }
    });
  }

}
