import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductsService } from 'app/products/products.service';
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-view-range',
  templateUrl: './view-range.component.html',
  styleUrls: ['./view-range.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent
  ]
})
export class ViewRangeComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private productsService = inject(ProductsService);

  /** Delinquency Range Data. */
  delinquencyRangeData: any;

  constructor() {
    this.route.data.subscribe((data: { delinquencyRange: any }) => {
      this.delinquencyRangeData = data.delinquencyRange;
    });
  }

  deleteDelinquencyRange() {
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: this.delinquencyRangeData.classification }
    });
    dialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.productsService.deleteDelinquencyRange(this.delinquencyRangeData.id).subscribe(() => {
          this.router.navigate(['../'], { relativeTo: this.route });
        });
      }
    });
  }
}
