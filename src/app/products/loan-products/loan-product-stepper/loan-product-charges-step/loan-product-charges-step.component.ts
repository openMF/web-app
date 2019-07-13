import { Component, OnInit, Input } from '@angular/core';
import { MatDialog } from '@angular/material';

import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';

@Component({
  selector: 'mifosx-loan-product-charges-step',
  templateUrl: './loan-product-charges-step.component.html',
  styleUrls: ['./loan-product-charges-step.component.scss']
})
export class LoanProductChargesStepComponent implements OnInit {

  @Input() loanProductsTemplate: any;
  @Input() currencyCode: any;
  @Input() multiDisburseLoan: any;

  chargeData: any;
  overdueChargeData: any;

  chargesDataSource: {}[] = [];
  displayedColumns: string[] = ['name', 'chargeCalculationType', 'amount', 'chargeTimeType', 'action'];

  constructor(public dialog: MatDialog) {
  }

  ngOnInit() {
    this.chargeData = this.loanProductsTemplate.chargeOptions;
    this.overdueChargeData = this.loanProductsTemplate.penaltyOptions.filter((penalty: any) => penalty.chargeTimeType.code === 'chargeTimeType.overdueInstallment');
  }

  addCharge(charge: any) {
    this.chargesDataSource = this.chargesDataSource.concat([charge.value]);
    charge.value = '';
  }

  deleteCharge(charge: any) {
    const deleteChargeDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `charge ${charge.name}` }
    });
    deleteChargeDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.chargesDataSource.splice(this.chargesDataSource.indexOf(charge), 1);
        this.chargesDataSource = this.chargesDataSource.concat([]);
      }
    });
  }

  get charges() {
    return {
      charges: this.chargesDataSource
    };
  }

}
