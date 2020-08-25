/** Angular Imports */
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';

/** Custom Services */
import { SavingsService } from 'app/savings/savings.service';

/** Custom Dialogs */
import { FormDialogComponent } from 'app/shared/form-dialog/form-dialog.component';
import { WaiveChargeDialogComponent } from '../custom-dialogs/waive-charge-dialog/waive-charge-dialog.component';
import { InactivateChargeDialogComponent } from '../custom-dialogs/inactivate-charge-dialog/inactivate-charge-dialog.component';
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';

/** Custom Models */
import { FormfieldBase } from 'app/shared/form-dialog/formfield/model/formfield-base';
import { InputBase } from 'app/shared/form-dialog/formfield/model/input-base';
import { DatepickerBase } from 'app/shared/form-dialog/formfield/model/datepicker-base';

/**
 * View Charge Component.
 */
@Component({
  selector: 'mifosx-view-charge',
  templateUrl: './view-charge.component.html',
  styleUrls: ['./view-charge.component.scss']
})
export class ViewChargeComponent {

  /** Charge data. */
  chargeData: any;
  /** Savings Account Data */
  savingsAccountData: any;

  /**
   * Retrieves the Charge data from `resolve`.
   * @param {SavingsService} savingsService Savings Service
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {MatDialog} dialog Dialog reference.
   * @param {DatePipe} datePipe DatePipe.
   */
  constructor(private savingsService: SavingsService,
              private route: ActivatedRoute,
              private datePipe: DatePipe,
              private router: Router,
              public dialog: MatDialog) {
    this.route.data.subscribe((data: { savingsAccountCharge: any }) => {
      this.chargeData = data.savingsAccountCharge;
    });
    this.route.data.subscribe((data: { savingsAccountData: any }) => {
      this.savingsAccountData = data.savingsAccountData;
    });
  }

  /**
   * Pays the charge.
   */
  payCharge() {
    const formfields: FormfieldBase[] = [
      new InputBase({
        controlName: 'amount',
        label: 'Amount',
        value: '',
        type: 'number',
        required: true
      }),
      new DatepickerBase({
        controlName: 'dueDate',
        label: 'Payment Date',
        value: '',
        type: 'date',
        required: true
      })
    ];
    const data = {
      title: 'Pay Charge',
      layout: { addButtonText: 'Confirm' },
      formfields: formfields
    };
    const payChargeDialogRef = this.dialog.open(FormDialogComponent, { data });
    payChargeDialogRef.afterClosed().subscribe((response: any) => {
      if (response.data) {
        const locale = 'en';
        const dateFormat = 'dd MMMM yyyy';
        const dataObject = {
          ...response.data.value,
          dueDate: this.datePipe.transform(response.data.value.dueDate, dateFormat),
          dateFormat,
          locale
        };
        this.savingsService.executeSavingsAccountChargesCommand(this.chargeData.accountId, 'paycharge', dataObject, this.chargeData.id)
          .subscribe(() => {
            this.reload();
          });
      }
    });
  }

  /**
   * Waive's the charge
   */
  waiveCharge() {
    const waiveChargeDialogRef = this.dialog.open(WaiveChargeDialogComponent, { data: { id: this.chargeData.id } });
    waiveChargeDialogRef.afterClosed().subscribe((response: any) => {
      if (response.confirm) {
        this.savingsService.executeSavingsAccountChargesCommand(this.chargeData.accountId, 'waive', {}, this.chargeData.id)
          .subscribe(() => {
            this.reload();
          });
      }
    });
  }

  /**
   * Inactivate's the charge
   */
  inactivateCharge() {
    const inactivateChargeDialogRef = this.dialog.open(InactivateChargeDialogComponent, { data: { id: this.chargeData.id } });
    inactivateChargeDialogRef.afterClosed().subscribe((response: any) => {
      if (response.confirm) {
        this.savingsService.executeSavingsAccountChargesCommand(this.chargeData.accountId, 'inactivate', {}, this.chargeData.id)
          .subscribe(() => {
            this.reload();
          });
      }
    });
  }

  /**
   * Edits the charge
   */
  editCharge() {
    const formfields: FormfieldBase[] = [
      new InputBase({
        controlName: 'amount',
        label: 'Amount',
        value: this.chargeData.amount || this.chargeData.amountOrPercentage,
        type: 'number',
        required: true
      })
    ];
    const data = {
      title: 'Edit Charge',
      layout: { addButtonText: 'Confirm' },
      formfields: formfields
    };
    const editChargeDialogRef = this.dialog.open(FormDialogComponent, { data });
    editChargeDialogRef.afterClosed().subscribe((response: any) => {
      if (response.data) {
        const locale = 'en';
        const dateFormat = 'dd MMMM yyyy';
        const dataObject = {
          ...response.data.value,
          dateFormat,
          locale
        };
        this.savingsService.editSavingsAccountCharge(this.chargeData.accountId, dataObject, this.chargeData.id)
          .subscribe(() => {
            this.reload();
          });
      }
    });
  }

  /**
   * Deletes the charge
   */
  deleteCharge() {
    const deleteChargeDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `charge id:${this.chargeData.id}` }
    });
    deleteChargeDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.savingsService.deleteSavingsAccountCharge(this.chargeData.accountId, this.chargeData.id)
          .subscribe(() => {
            this.reload();
          });
      }
    });
  }

  /**
   * Checks if charge is recurring
   */
  isRecurringCharge() {
    const chargeTimeType = this.chargeData.chargeTimeType.value;
    return chargeTimeType === 'Monthly Fee' || chargeTimeType === 'Annual Fee' || chargeTimeType === 'Weekly Fee';
  }

  /**
   * Refetches data fot the component
   * TODO: Replace by a custom reload component instead of hard-coded back-routing.
   */
  private reload() {
    const url: string = this.router.url.replace(`/${this.chargeData.id}`, '');
    const refreshUrl: string = this.router.url.slice(0, this.router.url.indexOf('savings-accounts') + 'savings-accounts'.length);
    this.router.navigateByUrl(refreshUrl, {skipLocationChange: true})
      .then(() => this.router.navigate([url]));
  }

}
