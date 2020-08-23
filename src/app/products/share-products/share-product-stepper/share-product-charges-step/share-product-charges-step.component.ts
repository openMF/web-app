import { Component, OnInit, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';

import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';

@Component({
  selector: 'mifosx-share-product-charges-step',
  templateUrl: './share-product-charges-step.component.html',
  styleUrls: ['./share-product-charges-step.component.scss']
})
export class ShareProductChargesStepComponent implements OnInit {

  @Input() shareProductsTemplate: any;
  @Input() currencyCode: FormControl;

  chargeData: any;

  chargesDataSource: {}[];
  displayedColumns: string[] = ['name', 'chargeCalculationType', 'amount', 'chargeTimeType', 'action'];

  pristine = true;

  constructor(public dialog: MatDialog) {
  }

  ngOnInit() {
    this.chargeData = this.shareProductsTemplate.chargeOptions;

    this.chargesDataSource = this.shareProductsTemplate.charges || [];
    this.pristine = true;

    this.currencyCode.valueChanges.subscribe(() => this.chargesDataSource = []);
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

  get shareProductCharges() {
    return {
      chargesSelected: this.chargesDataSource
    };
  }

}
