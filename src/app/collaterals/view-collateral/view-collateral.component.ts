import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ClientCollateralManagementService } from '@fineract/client';
import { MatDialog } from '@angular/material/dialog';

/** Custom Components */
import { DeleteDialogComponent } from '../../shared/delete-dialog/delete-dialog.component';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
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
import { DateFormatPipe } from '../../pipes/date-format.pipe';
import { FormatNumberPipe } from '../../pipes/format-number.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-view-collateral',
  templateUrl: './view-collateral.component.html',
  styleUrls: ['./view-collateral.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent,
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
    DateFormatPipe,
    FormatNumberPipe
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
    private clientCollateralManagementService: ClientCollateralManagementService,
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
        this.clientCollateralManagementService
          .deleteCollateral1(this.clientCollateralData.clientId, this.clientCollateralData.id)
          .subscribe(() => {
            this.router.navigate(['../../'], { relativeTo: this.route });
          });
      }
    });
  }
}
