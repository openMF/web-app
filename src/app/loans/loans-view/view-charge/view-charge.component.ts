/** Angular Imports */
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';

/** Custom Services */
import { LoansService } from 'app/loans/loans.service';

/** Custom Dialogs */
import { FormDialogComponent } from 'app/shared/form-dialog/form-dialog.component';
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';
import { ConfirmationDialogComponent } from 'app/shared/confirmation-dialog/confirmation-dialog.component';

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
  /** Loans Account Data */
  loansAccountData: any;

  /**
   * Retrieves the Charge data from `resolve`.
   * @param {LoansService} loansService Loans Service
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {MatDialog} dialog Dialog reference.
   * @param {DatePipe} datePipe DatePipe.
   */
  constructor(private loansService: LoansService,
              private route: ActivatedRoute,
              private datePipe: DatePipe,
              private router: Router,
              public dialog: MatDialog) {
    this.route.data.subscribe((data: { loansAccountCharge: any }) => {
      this.chargeData = data.loansAccountCharge;
    });
    this.route.parent.parent.data.subscribe((data: { loanDetailsData: any }) => {
      this.loansAccountData = data.loanDetailsData;
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
        this.loansService.executeLoansAccountChargesCommand(this.chargeData.accountId, 'paycharge', dataObject, this.chargeData.id)
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
    const waiveChargeDialogRef = this.dialog.open(ConfirmationDialogComponent, { data: { heading: 'Waive Charge', dialogContext: `Are you sure you want to waive charge with id: ${this.chargeData.id}`, type: 'Basic' } });
    waiveChargeDialogRef.afterClosed().subscribe((response: any) => {
      if (response.confirm) {
        this.loansService.executeLoansAccountChargesCommand(this.chargeData.accountId, 'waive', {}, this.chargeData.id)
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
        this.loansService.editLoansAccountCharge(this.loansAccountData.id, dataObject, this.chargeData.id)
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
        this.loansService.deleteLoansAccountCharge(this.loansAccountData.id, this.chargeData.id)
          .subscribe(() => {
            this.reload();
          });
      }
    });
  }

  /**
   * Refetches data fot the component
   * TODO: Replace by a custom reload component instead of hard-coded back-routing.
   */
  private reload() {
    const clientId = this.loansAccountData.clientId;
    const url: string = this.router.url.replace(`/${this.chargeData.id}`, '');
    this.router.navigateByUrl(`/clients/${clientId}/loansaccounts`, {skipLocationChange: true})
      .then(() => this.router.navigate([url]));
  }

}
