import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

/** Custom Services */
import { ProductsService } from 'app/products/products.service';

/** Custom Components */
import { TranslateService } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { DeleteDialogComponent } from '../../../shared/delete-dialog/delete-dialog.component';
import { MatButton } from '@angular/material/button';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatCard, MatCardContent } from '@angular/material/card';

/**
 * View Collateral Component
 */
@Component({
  selector: 'mifosx-view-collateral',
  templateUrl: './view-collateral.component.html',
  styleUrls: ['./view-collateral.component.scss'],
  imports: [
    MatButton,
    RouterLink,
    FaIconComponent,
    MatCard,
    MatCardContent,
    TranslatePipe,
    NgxTranslatePipe
  ]
})
export class ViewCollateralComponent {
  /** Collateral Data */
  collateralData: any;

  /**
   * Retrieves the Collateral Data from 'resolve.
   * @param {ProductsService} productsService Products Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {MatDialog} dialog Dialog reference.
   * @param {TranslateService} translateService Translate Service.
   */
  constructor(
    private productsService: ProductsService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private translateService: TranslateService
  ) {
    this.route.data.subscribe((data: { collateral: any }) => {
      this.collateralData = data.collateral;
    });
  }

  /**
   * Deletes the collateral and redirects to collaterals
   */
  deleteCollateral() {
    const deleteCollateralDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: this.translateService.instant('labels.text.Collateral') + ' ' + this.collateralData.id }
    });
    deleteCollateralDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.productsService.deleteCollateral(this.collateralData.id).subscribe(() => {
          this.router.navigate(['/products/collaterals']);
        });
      }
    });
  }
}
