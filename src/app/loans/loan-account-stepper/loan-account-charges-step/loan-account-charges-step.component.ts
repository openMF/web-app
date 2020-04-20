import { Component, OnInit, Input } from '@angular/core';
import { MatDialog } from '@angular/material';
import { FormControl } from '@angular/forms';

import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';

@Component({
  selector: 'mifosx-loan-account-charges-step',
  templateUrl: './loan-account-charges-step.component.html',
  styleUrls: ['./loan-account-charges-step.component.scss']
})
export class LoanAccountChargesStepComponent implements OnInit {
  @Input() loanAccountInfo: any;

  chargeData: any;
  chargesDataSource: {}[];
  displayedColumns: string[] = ['name', 'chargeCalculationType', 'amount', 'chargeTimeType', 'action'];
  pristine = true;

  constructor(public dialog: MatDialog) {}

  ngOnInit() {
    if (this.loanAccountInfo) {
      this.chargeData = this.loanAccountInfo.chargeOptions;
      this.chargesDataSource = this.loanAccountInfo.charges;
    } else {
      this.chargesDataSource = [];
    }
    this.pristine = true;
  }

  ngOnChanges() {
    this.chargesDataSource = [];
    if (this.loanAccountInfo) {
      this.chargeData = this.loanAccountInfo.chargeOptions;
      this.chargesDataSource = this.loanAccountInfo.charges || [];
    }
  }

  addCharge(charge: any) {
    this.chargesDataSource = this.chargesDataSource.concat([charge.value]);
    charge.value = '';
    this.pristine = false;
  }

  deleteCharge(charge: any) {
    const deleteChargeDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `charge ${charge.name}` }
    });
    deleteChargeDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.chargesDataSource.splice(this.chargesDataSource.indexOf(charge), 1);
        this.chargesDataSource = this.chargesDataSource.concat([]);
        this.pristine = false;
      }
    });
  }

  get loanAccountCharges() {
    return {
      charges: this.chargesDataSource
    };
  }
}
