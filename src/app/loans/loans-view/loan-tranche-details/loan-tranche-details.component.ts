import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { Dates } from 'app/core/utils/dates';
import { LoansService } from 'app/loans/loans.service';
import { SettingsService } from 'app/settings/settings.service';
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';
import { FormDialogComponent } from 'app/shared/form-dialog/form-dialog.component';
import { DatepickerBase } from 'app/shared/form-dialog/formfield/model/datepicker-base';
import { FormfieldBase } from 'app/shared/form-dialog/formfield/model/formfield-base';
import { InputBase } from 'app/shared/form-dialog/formfield/model/input-base';

@Component({
  selector: 'mifosx-loan-tranche-details',
  templateUrl: './loan-tranche-details.component.html',
  styleUrls: ['./loan-tranche-details.component.scss'],
})
export class LoanTrancheDetailsComponent implements OnInit {
  loanDetails: any;
  return: any;
  status: any;
  count: number;
  expectedDisbursementColumns: string[] = ['expected disbursement on', 'disbursed on', 'principal', 'action'];
  emivariationColumns: string[] = ['emi amount variation from', 'fixed emi amount'];

  loanId: number;
  currentPrincipalAmount: number;
  minDate = new Date(2000, 0, 1);
  maxDate = new Date(2100, 0, 1);
  disbursementDataSource: {}[] = [];
  totalMultiDisbursed: number = null;
  disallowExpectedDisbursements = false;
  pristine = true;

  /**
   * Retrieves the loans data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute,
    public dialog: MatDialog,
    private loanServices: LoansService,
    private settingsService: SettingsService,
    private dateUtils: Dates) {
    this.route.parent.data.subscribe((data: { loanDetailsData: any }) => {
      this.loanId = data.loanDetailsData.id;
      this.loanDetails = data.loanDetailsData;
      this.disallowExpectedDisbursements = this.loanDetails.disallowExpectedDisbursements || false;
      this.disbursementDataSource = data.loanDetailsData.disbursementDetails;
      this.currentPrincipalAmount = this.loanDetails.approvedPrincipal;
    });
  }

  ngOnInit() {
    this.maxDate = this.settingsService.maxFutureDate;
    this.status = this.loanDetails.status.value;
  }

  showAddTrancheButtons() {
    this.return = true;
    if (
      this.status === 'Closed (obligations met)' ||
      this.status === 'Overpaid' ||
      this.status === 'Closed (rescheduled)' ||
      this.status === 'Closed (written off)' ||
      this.status === 'Submitted and pending approval' ||
      this.disallowExpectedDisbursements
    ) {
      this.return = false;
    }

    this.calculateTotalDisbursedAmount();

    if (this.totalMultiDisbursed === this.currentPrincipalAmount || this.return === false) {
      return false;
    }

    return true;
  }

  showActionsTrancheButtons() {
    if (
      this.status === 'Closed (obligations met)' ||
      this.status === 'Overpaid' ||
      this.status === 'Closed (rescheduled)' ||
      this.status === 'Closed (written off)' ||
      this.status === 'Submitted and pending approval' ||
      this.disallowExpectedDisbursements
    ) {
      return false;
    }

    return true;
  }

  /**
   * Adds the Principal Disbursed.
   */
  calculateTotalDisbursedAmount() {
    this.totalMultiDisbursed = 0;
    this.count = 0;
    this.disbursementDataSource.forEach((item: any) => {
      this.totalMultiDisbursed += (item.principal * 1);
      this.count += 1;
    });
  }

  buildForm(expectedDisbursementDate: Date, principal: number): FormfieldBase[] {
    const formBase: FormfieldBase[] = [
      new DatepickerBase({
        controlName: 'expectedDisbursementDate',
        label: 'Expected Disbursement Date',
        value: expectedDisbursementDate || '',
        type: 'datetime-local',
        minDate: this.minDate,
        maxDate: this.maxDate,
        required: true,
        order: 1
      }),
      new InputBase({
        controlName: 'principal',
        label: 'Principal',
        value: principal,
        type: 'number',
        required: true,
        order: 2
      })
    ];
    return formBase;
  }

  /**
   * Adds the Disbursement Data entry form to given Disbursement Data entry.
   */
  addDisbursementDataEntry() {
    this.calculateTotalDisbursedAmount();

    const data = {
      title: 'Add Disbursement Details',
      layout: { addButtonText: 'Add' },
      formfields: this.buildForm(new Date(), (this.currentPrincipalAmount - this.totalMultiDisbursed))
    };
    const disbursementDialogRef = this.dialog.open(FormDialogComponent, { data });
    disbursementDialogRef.afterClosed().subscribe((response: any) => {
      if (response.data) {
        const principal = response.data.value.principal * 1;
        if ((this.totalMultiDisbursed + principal) <= this.currentPrincipalAmount) {
          this.disbursementDataSource = this.disbursementDataSource.concat(response.data.value);
          this.pristine = false;
        }
      }
    });
  }

  /**
   * Edit the Disbursement Data entry form to given Disbursement Data entry.
   */
  editDisbursementDataEntry(index: number) {
    const principal: number = this.disbursementDataSource[index]['principal'] * 1;
    const expectedDisbursementDate: Date = this.dateUtils.parseDate(this.disbursementDataSource[index]['expectedDisbursementDate']);

    const data = {
      title: 'Edit Disbursement Details',
      layout: { addButtonText: 'Save' },
      formfields: this.buildForm(expectedDisbursementDate, principal)
    };
    const disbursementDialogRef = this.dialog.open(FormDialogComponent, { data });
    disbursementDialogRef.afterClosed().subscribe((response: any) => {
      if (response.data) {
        const newPrincipal = response.data.value.principal * 1;
        if ((this.totalMultiDisbursed - principal + newPrincipal) <= this.currentPrincipalAmount) {
          this.disbursementDataSource[index]['principal'] = newPrincipal;
          this.disbursementDataSource[index]['expectedDisbursementDate'] = response.data.value.expectedDisbursementDate;
          this.pristine = false;
        }
      }
    });
  }

  removeDisbursementDataEntry(index: any) {
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `this` }
    });
    dialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        const principal = this.disbursementDataSource[index]['principal'] * 1;
        this.disbursementDataSource.splice(index, 1);
        this.disbursementDataSource = this.disbursementDataSource.concat([]);
        this.totalMultiDisbursed -= principal;
        this.pristine = false;
      }
    });
  }

  editDisbursementData() {
    const disbursementData: any = [];
    this.disbursementDataSource.forEach((item: any) => {
      disbursementData.push({
        expectedDisbursementDate: this.dateUtils.formatDate(item.expectedDisbursementDate, this.settingsService.dateFormat),
        principal: item.principal
      });
    });

    const payload = {
      disbursementData: disbursementData,
      dateFormat: this.settingsService.dateFormat,
      locale: this.settingsService.language.code
    };
    this.loanServices.editDisbursements(this.loanId, payload).toPromise()
    .then(result => {
      this.pristine = true;
    });
  }

}
