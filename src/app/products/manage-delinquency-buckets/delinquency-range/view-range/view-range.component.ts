import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductsService } from 'app/products/products.service';
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';
import { HasPermissionDirective } from '../../../../directives/has-permission/has-permission.directive';
import { MatButton } from '@angular/material/button';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatCard, MatCardContent } from '@angular/material/card';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';

@Component({
  selector: 'mifosx-view-range',
  templateUrl: './view-range.component.html',
  styleUrls: ['./view-range.component.scss'],
  imports: [
    HasPermissionDirective,
    MatButton,
    RouterLink,
    FaIconComponent,
    MatCard,
    MatCardContent,
    TranslatePipe,
    NgxTranslatePipe
  ]
})
export class ViewRangeComponent {
  /** Delinquency Range Data. */
  delinquencyRangeData: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private productsService: ProductsService
  ) {
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
