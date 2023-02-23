import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Dates } from 'app/core/utils/dates';
import { LoansService } from 'app/loans/loans.service';
import { SettingsService } from 'app/settings/settings.service';
import { ConfirmationDialogComponent } from 'app/shared/confirmation-dialog/confirmation-dialog.component';
import { FormDialogComponent } from 'app/shared/form-dialog/form-dialog.component';
import { FormfieldBase } from 'app/shared/form-dialog/formfield/model/formfield-base';
import { InputBase } from 'app/shared/form-dialog/formfield/model/input-base';
import { SelectBase } from 'app/shared/form-dialog/formfield/model/select-base';

@Component({
  selector: 'mifosx-edit-repayment-schedule',
  templateUrl: './edit-repayment-schedule.component.html',
  styleUrls: ['./edit-repayment-schedule.component.scss']
})
export class EditRepaymentScheduleComponent implements OnInit {

  /** Loan ID. */
  loanId: string;
  /** Indicates If the Schedule has been changed */
  wasChanged = false;
  /** Indicates If the Schedule has been validated */
  wasValidated = false;
  /** Stores the Repayment Schedule data */
  repaymentScheduleDetails: any[] = [];
  /** Stores the Installments changed */
  repaymentScheduleChanges: any = {};

  /**
   * @param {LoansService} systemService Loan Service.
   * @param {Router} router Router for navigation.
   * @param {ActivatedRoute} route Activated Route.
   * @param {MatDialog} dialog Confirmation Dialogs.
   * @param {Dates} dateUtils Dates Utils.
   * @param {SettingsService} settingsService Settings Service
   */
  constructor(private loansService: LoansService,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private dateUtils: Dates,
    private settingsService: SettingsService) {
    this.loanId = this.route.snapshot.params['loanId'];
    this.getRepaymentSchedule();
  }

  ngOnInit(): void {
    this.repaymentScheduleChanges = {};
  }

  getRepaymentSchedule(): void {
    this.loansService.getLoanAccountResource(this.loanId, 'repaymentSchedule').subscribe((response: any) => {
      this.repaymentScheduleDetails = response.repaymentSchedule;
    });
  }

  applyPattern(): void {
    const periods: any = [];
    this.repaymentScheduleDetails['periods'].forEach((period: any) => {
      if (period.period) {
        periods.push({idx: period.period, dueDate: this.dateUtils.formatDate(period.dueDate, this.settingsService.dateFormat) });
      }
    });
    const formfields: FormfieldBase[] = [
      new SelectBase({
        controlName: 'fromPeriod',
        label: 'From Date',
        value: '',
        options: { label: 'dueDate', value: 'idx', data: periods },
        required: true
      }),
      new SelectBase({
        controlName: 'toPeriod',
        label: 'To Date',
        value: '',
        options: { label: 'dueDate', value: 'idx', data: periods },
        required: true
      }),
      new InputBase({
        controlName: 'amount',
        label: 'Installment Amount',
        value: '',
        type: 'number',
        required: true
      }),
    ];
    const data = {
      title: 'Pattern Update',
      formfields: formfields
    };
    const addDialogRef = this.dialog.open(FormDialogComponent, { data });
    addDialogRef.afterClosed().subscribe((response: any) => {
      if (response.data) {
        const fromPeriod = response.data.value.fromPeriod;
        const toPeriod = response.data.value.toPeriod;
        const amount = response.data.value.amount;
        const periodsVariation: any = [];
        this.repaymentScheduleDetails['periods'].forEach((period: any) => {
          const dueDate = this.dateUtils.formatDate(period.dueDate, this.settingsService.dateFormat);
          if (period.period && fromPeriod <= period.period && toPeriod >= period.period) {
            if (period.totalDueForPeriod !== amount) {
              period.totalDueForPeriod = amount;
              this.repaymentScheduleChanges[dueDate] = {dueDate: dueDate, installmentAmount: amount};
              this.wasChanged = true;
              period['changed'] = true;
            }
          }
          periodsVariation.push(period);
        });
        this.repaymentScheduleDetails['periods'] = periodsVariation;
      }
    });
  }

  reset(): void {
    const recoverScheduleDialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: { heading: 'Recover Original Schedule', dialogContext: 'Are you sure you want recover the Original Schedule'}
    });
    recoverScheduleDialogRef.afterClosed().subscribe((responseConfirmation: any) => {
      if (responseConfirmation.confirm) {
        this.loansService.applyCommandLoanScheduleVariations(this.loanId, 'deleteVariations', {}).subscribe((response: any) => {
          this.getRepaymentSchedule();
          this.wasChanged = false;
          this.wasValidated = false;
        });
      }
    });
  }

  validate(): void {
    this.loansService.applyCommandLoanScheduleVariations(this.loanId, 'calculateLoanSchedule', this.getPayload()).subscribe((response: any) => {
      this.repaymentScheduleDetails['periods'] = [];
      response['periods'].forEach((period: any) => {
        period['changed'] = true;
        this.repaymentScheduleDetails['periods'].push(period);
        this.wasValidated = true;
      });
    });
  }

  submit(): void {
    this.loansService.applyCommandLoanScheduleVariations(this.loanId, 'addVariations', this.getPayload()).subscribe((response: any) => {
      this.router.navigate(['../../repayment-schedule'], { relativeTo: this.route });
    });
  }

  private getPayload(): any {
    const modifiedinstallments: any = [];
    Object.keys(this.repaymentScheduleChanges).forEach((key: string) => {
      modifiedinstallments.push(this.repaymentScheduleChanges[key]);
    });
    const dateFormat = this.settingsService.dateFormat;
    const locale = this.settingsService.language.code;
    return {
      exceptions: {
        modifiedinstallments
      },
      dateFormat,
      locale
    };
  }

}
