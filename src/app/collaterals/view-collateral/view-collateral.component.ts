import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CollateralsService } from '../collaterals.service';
import { MatDialog } from '@angular/material/dialog';

/** Custom Components */
import { DeleteDialogComponent } from '../../shared/delete-dialog/delete-dialog.component';
import { HasPermissionDirective } from '../../directives/has-permission/has-permission.directive';
import { MatButton } from '@angular/material/button';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatCard, MatCardContent } from '@angular/material/card';
import {
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
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';
import { DateFormatPipe } from '../../pipes/date-format.pipe';
import { FormatNumberPipe } from '../../pipes/format-number.pipe';

@Component({
  selector: 'mifosx-view-collateral',
  templateUrl: './view-collateral.component.html',
  styleUrls: ['./view-collateral.component.scss'],
  imports: [
    HasPermissionDirective,
    MatButton,
    RouterLink,
    FaIconComponent,
    MatCard,
    MatCardContent,
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    TranslatePipe,
    DateFormatPipe,
    FormatNumberPipe,
    NgxTranslatePipe
  ]
})
export class ViewCollateralComponent {
  clientCollateralData: any;

  collateralColumns: string[] = [
    'ID',
    'Last Repayment',
    'Remaining Amount',
    'Last Repayment Date'
  ];

  constructor(
    private route: ActivatedRoute,
    private collateralsService: CollateralsService,
    private router: Router,
    private dialog: MatDialog
  ) {
    this.route.data.subscribe((data: { clientCollateralData: any }) => {
      this.clientCollateralData = data.clientCollateralData;
    });
  }

  /**
   * Deletes the Collateral and redirects to CLients Page.
   */
  deleteCollateral() {
    const deleteCollateralDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `collateral ${this.clientCollateralData.id}` }
    });
    deleteCollateralDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.collateralsService
          .deleteCollateral(this.clientCollateralData.clientId, this.clientCollateralData.id)
          .subscribe(() => {
            this.router.navigate(['../../'], { relativeTo: this.route });
          });
      }
    });
  }
}
