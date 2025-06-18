import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductsService } from 'app/products/products.service';
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';
import { HasPermissionDirective } from '../../../../directives/has-permission/has-permission.directive';
import { MatButton } from '@angular/material/button';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatCard, MatCardContent } from '@angular/material/card';
import { NgFor } from '@angular/common';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';

@Component({
  selector: 'mifosx-view-bucket',
  templateUrl: './view-bucket.component.html',
  styleUrls: ['./view-bucket.component.scss'],
  imports: [
    HasPermissionDirective,
    MatButton,
    RouterLink,
    FaIconComponent,
    MatCard,
    MatCardContent,
    NgFor,
    TranslatePipe,
    NgxTranslatePipe
  ]
})
export class ViewBucketComponent {
  /** Delinquency Bucket Data. */
  delinquencyBucketData: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private productsService: ProductsService
  ) {
    this.route.data.subscribe((data: { delinquencyBucket: any }) => {
      this.delinquencyBucketData = data.delinquencyBucket;
      this.delinquencyBucketData.ranges = this.delinquencyBucketData.ranges.sort(
        (objA: { minimumAge: number }, objB: { minimumAge: number }) => objA.minimumAge - objB.minimumAge
      );
    });
  }

  deleteDelinquencyBucket() {
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: this.delinquencyBucketData.name }
    });
    dialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.productsService.deleteDelinquencyBucket(this.delinquencyBucketData.id).subscribe(() => {
          this.router.navigate(['../'], { relativeTo: this.route });
        });
      }
    });
  }
}
