import { Component, OnInit, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';

import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';

@Component({
  selector: 'mifosx-recurring-deposit-product-charges-step',
  templateUrl: './recurring-deposit-product-charges-step.component.html',
  styleUrls: ['./recurring-deposit-product-charges-step.component.scss']
})
export class RecurringDepositProductChargesStepComponent implements OnInit {

  @Input() recurringDepositProductsTemplate: any;
  @Input() currencyCode: FormControl;

  chargeData: any;

  chargesDataSource: {}[];
  displayedColumns: string[] = ['name', 'chargeCalculationType', 'amount', 'chargeTimeType', 'action'];

  constructor(public dialog: MatDialog) {
  }

  ngOnInit() {
    this.chargeData = this.recurringDepositProductsTemplate.chargeOptions;
    if (!(this.recurringDepositProductsTemplate === undefined) && this.recurringDepositProductsTemplate.id) {
      this.chargesDataSource = this.recurringDepositProductsTemplate.charges;
    } else {
      this.chargesDataSource = [];
    }
    this.currencyCode.valueChanges.subscribe(() => this.chargesDataSource = []);
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

  get recurringDepositProductCharges() {
    return {
      charges: this.chargesDataSource
    };
  }

}
