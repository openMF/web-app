import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CollateralsService } from '../collaterals.service';
import { MatDialog } from '@angular/material/dialog';

/** Custom Components */
import { DeleteDialogComponent } from '../../shared/delete-dialog/delete-dialog.component';


@Component({
  selector: 'mifosx-view-collateral',
  templateUrl: './view-collateral.component.html',
  styleUrls: ['./view-collateral.component.scss']
})
export class ViewCollateralComponent implements OnInit {

  clientCollateralData: any;

  collateralColumns: string[] = ['ID', 'Last Repayment', 'Remaining Amount', 'Last Repayment Date'];

  constructor(
    private route: ActivatedRoute,
    private collateralsService: CollateralsService,
    private router: Router,
    private dialog: MatDialog
  ) {
    this.route.data.subscribe((data: {clientCollateralData: any}) => {
      this.clientCollateralData = data.clientCollateralData;
    });
  }

  ngOnInit(): void {
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
        this.collateralsService.deleteCollateral(this.clientCollateralData.clientId, this.clientCollateralData.id)
          .subscribe(() => {
            this.router.navigate(['../../'], { relativeTo: this.route });
          });
      }
    });
  }

}
