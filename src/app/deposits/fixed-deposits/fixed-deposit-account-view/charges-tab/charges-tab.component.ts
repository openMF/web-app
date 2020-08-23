/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource, MatTable } from '@angular/material/table';
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
 * Charges Tab Component
 * Note: Fixed deposits endpoints are not supported so using Savings endpoints.
 */
@Component({
  selector: 'mifosx-charges-tab',
  templateUrl: './charges-tab.component.html',
  styleUrls: ['./charges-tab.component.scss']
})
export class ChargesTabComponent implements OnInit {

  /** Fixed Deposits Account Data */
  fixedDepositsAccountData: any;
  /** Charges Data */
  chargesData: any[];
  /** Data source for charges table. */
  dataSource: MatTableDataSource<any>;
  /** Toggles Charges Table */
  showInactiveCharges = false;
  /** Columns to be displayed in charges table. */
  displayedColumns: string[] = [
    'name',
    'feeOrPenalty',
    'paymentDueAt',
    'dueAsOf',
    'repeatsOn',
    'calculationType',
    'due',
    'paid',
    'waived',
    'outstanding',
    'actions'
  ];

  /** Charges Table Reference */
  @ViewChild('chargesTable', { static: true }) chargesTableRef: MatTable<Element>;

  /**
   * Retrieves the Fixed Deposits account data from `resolve`.
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
    this.route.parent.data.subscribe((data: { fixedDepositsAccountData: any }) => {
      this.fixedDepositsAccountData = data.fixedDepositsAccountData;
      this.chargesData = this.fixedDepositsAccountData.charges;
    });
  }

  ngOnInit() {
    const activeCharges = this.chargesData ? this.chargesData.filter(charge => charge.isActive) : [];
    this.dataSource = new MatTableDataSource(activeCharges);
  }

  /**
   * Toggles datasource for active/inactive charges.
   */
  toggleCharges() {
    this.showInactiveCharges = !this.showInactiveCharges;
    if (!this.showInactiveCharges) {
      const activeCharges = this.chargesData.filter(charge => charge.isActive);
      this.dataSource.data = activeCharges;
    } else {
      const inActiveCharges = this.chargesData.filter(charge => !charge.isActive);
      this.dataSource.data = inActiveCharges;
    }
    this.chargesTableRef.renderRows();
  }

  /**
   * Pays the charge.
   * @param {any} chargeId Charge Id
   */
  payCharge(chargeId: any) {
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
      title: `Pay Charge ${chargeId}`,
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
        this.savingsService.executeSavingsAccountChargesCommand(this.fixedDepositsAccountData.id, 'paycharge', dataObject, chargeId)
          .subscribe(() => {
            this.reload();
          });
      }
    });
  }

  /**
   * Waive's the charge
   * @param {any} chargeId Charge Id
   */
  waiveCharge(chargeId: any) {
    const waiveChargeDialogRef = this.dialog.open(WaiveChargeDialogComponent, { data: { id: chargeId } });
    waiveChargeDialogRef.afterClosed().subscribe((response: any) => {
      if (response.confirm) {
        this.savingsService.executeSavingsAccountChargesCommand(this.fixedDepositsAccountData.id, 'waive', {}, chargeId)
          .subscribe(() => {
            this.reload();
          });
      }
    });
  }

  /**
   * Inactivate's the charge
   * @param {any} chargeId Charge Id
   */
  inactivateCharge(chargeId: any) {
    const inactivateChargeDialogRef = this.dialog.open(InactivateChargeDialogComponent, { data: { id: chargeId } });
    inactivateChargeDialogRef.afterClosed().subscribe((response: any) => {
      if (response.confirm) {
        this.savingsService.executeSavingsAccountChargesCommand(this.fixedDepositsAccountData.id, 'inactivate', {}, chargeId)
          .subscribe(() => {
            this.reload();
          });
      }
    });
  }

  /**
   * Edits the charge
   * @param {any} charge Charge
   */
  editCharge(charge: any) {
    const formfields: FormfieldBase[] = [
      new InputBase({
        controlName: 'amount',
        label: 'Amount',
        value: charge.amount || charge.amountOrPercentage,
        type: 'number',
        required: true
      })
    ];
    const data = {
      title: `Edit Charge ${charge.id}`,
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
        this.savingsService.editSavingsAccountCharge(this.fixedDepositsAccountData.id, dataObject, charge.id)
          .subscribe(() => {
            this.reload();
          });
      }
    });
  }

  /**
   * Deletes the charge
   * @param {any} chargeId Charge Id
   */
  deleteCharge(chargeId: any) {
    const deleteChargeDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `charge id:${chargeId}` }
    });
    deleteChargeDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.savingsService.deleteSavingsAccountCharge(this.fixedDepositsAccountData.id, chargeId)
          .subscribe(() => {
            this.reload();
          });
      }
    });
  }

  /**
   * Checks if charge is recurring.
   * @param {any} charge Charge
   */
  isRecurringCharge(charge: any) {
    return charge.chargeTimeType.value === 'Monthly Fee' || charge.chargeTimeType.value === 'Annual Fee' || charge.chargeTimeType.value === 'Weekly Fee';
  }

  /**
   * Stops the propagation to view charge page.
   * @param $event Mouse Event
   */
  routeEdit($event: MouseEvent) {
    $event.stopPropagation();
  }

  /**
   * Refetches data fot the component
   * TODO: Replace by a custom reload component instead of hard-coded back-routing.
   */
  private reload() {
    const clientId = this.fixedDepositsAccountData.clientId;
    const url: string = this.router.url;
    this.router.navigateByUrl(`/clients/${clientId}/fixed-deposits-accounts`, {skipLocationChange: true})
      .then(() => this.router.navigate([url]));
  }

}
