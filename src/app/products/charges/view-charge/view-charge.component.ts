/** Angular Imports */
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { ProductsService } from 'app/products/products.service';

/** Custom Components */
import { TranslateService } from '@ngx-translate/core';
import { DeleteDialogComponent } from '../../../shared/delete-dialog/delete-dialog.component';

/**
 * View Charge Component.
 */
@Component({
  selector: 'mifosx-view-charge',
  templateUrl: './view-charge.component.html',
  styleUrls: ['./view-charge.component.scss']
})
export class ViewChargeComponent {

  /** Charge data. */
  chargeData: any;
  /** Boolean for MinCap and MaxCap */
  minCap: boolean;
  maxCap: boolean;
  /**
   * Retrieves the charge data from `resolve`.
   * @param {ProductsService} productsService Products Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {MatDialog} dialog Dialog reference.
   * @param {TranslateService} translateService Translate Service.
   */
  constructor(private productsService: ProductsService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private translateService: TranslateService) {
    this.route.data.subscribe((data: { charge: any }) => {
      this.chargeData = data.charge;
      if (this.chargeData.minCap) {
        this.minCap = true;
      }
      if (this.chargeData.maxCap) {
        this.maxCap = true;
      }
    });
  }

  /**
   * Deletes the charge and redirects to charges.
   */
  deleteCharge() {
    const deleteChargeDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: this.translateService.instant('labels.inputs.Charge') + ' ' + this.chargeData.id}
    });
    deleteChargeDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.productsService.deleteCharge(this.chargeData.id)
          .subscribe(() => {
            this.router.navigate(['/products/charges']);
          });
      }
    });
  }

}
