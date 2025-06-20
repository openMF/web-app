import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Dates } from 'app/core/utils/dates';
import { LoansService } from 'app/loans/loans.service';
import { SettingsService } from 'app/settings/settings.service';
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';
import { FormDialogComponent } from 'app/shared/form-dialog/form-dialog.component';
import { DatepickerBase } from 'app/shared/form-dialog/formfield/model/datepicker-base';
import { FormfieldBase } from 'app/shared/form-dialog/formfield/model/formfield-base';
import { AnyKindOfDictionary } from 'cypress/types/lodash';
import {
  MatTable,
  MatColumnDef,
  MatHeaderCellDef,
  MatHeaderCell,
  MatCellDef,
  MatCell,
  MatHeaderRowDef,
  MatHeaderRow,
  MatRowDef,
  MatRow
} from '@angular/material/table';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { DateFormatPipe } from '../../../pipes/date-format.pipe';
import { FormatNumberPipe } from '../../../pipes/format-number.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-loan-term-variations-tab',
  templateUrl: './loan-term-variations-tab.component.html',
  styleUrls: ['./loan-term-variations-tab.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    MatIconButton,
    MatTooltip,
    FaIconComponent,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    DateFormatPipe,
    FormatNumberPipe
  ]
})
export class LoanTermVariationsTabComponent {
  /** Loan Term Variation Data */
  loanTermVariationsData: any[] = [];
  loanDTermVariationsColumns: string[] = [
    'row',
    'startDate',
    'endDate',
    'days',
    'actions'
  ];

  emiAmountData: any[] = [];
  interestRateData: any[] = [];
  dueDateData: any[] = [];
  deleteInstallmentData: any[] = [];
  insertInstallmentData: any[] = [];
  principalAmountData: any[] = [];
  graceOnInterestData: any[] = [];
  graceOnPrincipalData: any[] = [];
  extendRepaymentPeriodData: any[] = [];
  interestRateFromInstallmentData: any[] = [];
  interestPausesData: any[] = [];
  invalidData: any[] = [];

  loanId: number;
  clientId: AnyKindOfDictionary;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dates: Dates,
    private settingsService: SettingsService,
    private loansService: LoansService,
    private dialog: MatDialog
  ) {
    this.interestPausesData = [];
    this.clientId = this.route.parent.parent.snapshot.paramMap.get('clientId');
    this.route.data.subscribe((data: { loanDetailsData: any }) => {
      this.loanId = data.loanDetailsData.id;
      this.loanTermVariationsData = [];
      data.loanDetailsData.loanTermVariations?.forEach((item: any) => {
        item.days = dates.calculateDiff(new Date(item.termVariationApplicableFrom), new Date(item.dateValue)) + 1;
        switch (item.termType.value) {
          case 'emiAmount':
            this.emiAmountData.push(item);
            break;
          case 'interestRate':
            this.interestRateData.push(item);
            break;
          case 'deleteInstallment':
            this.deleteInstallmentData.push(item);
            break;
          case 'dueDate':
            this.dueDateData.push(item);
            break;
          case 'insertInstallment':
            this.insertInstallmentData.push(item);
            break;
          case 'principalAmount':
            this.principalAmountData.push(item);
            break;
          case 'graceOnInterest':
            this.graceOnInterestData.push(item);
            break;
          case 'graceOnPrincipal':
            this.graceOnPrincipalData.push(item);
            break;
          case 'extendRepaymentPeriod':
            this.extendRepaymentPeriodData.push(item);
            break;
          case 'interestRateForInstallment':
            this.interestRateFromInstallmentData.push(item);
            break;
          case 'interestPause':
            this.interestPausesData.push(item);
            break;
          default:
            this.invalidData.push(item);
            break;
        }
      });

      if (this.deleteInstallmentData.length > 0) {
        this.loanTermVariationsData.push({
          label: 'Delete Installment',
          data: this.deleteInstallmentData
        });
      }
      if (this.dueDateData.length > 0) {
        this.loanTermVariationsData.push({
          label: 'Due Date',
          data: this.dueDateData
        });
      }
      if (this.emiAmountData.length > 0) {
        this.loanTermVariationsData.push({
          label: 'EMI Amount',
          data: this.emiAmountData
        });
      }
      if (this.extendRepaymentPeriodData.length > 0) {
        this.loanTermVariationsData.push({
          label: 'Extend Repayment Period',
          data: this.extendRepaymentPeriodData
        });
      }
      if (this.graceOnInterestData.length > 0) {
        this.loanTermVariationsData.push({
          label: 'Grace On Interest',
          data: this.graceOnInterestData
        });
      }
      if (this.graceOnPrincipalData.length > 0) {
        this.loanTermVariationsData.push({
          label: 'Grace On Principal',
          data: this.graceOnPrincipalData
        });
      }
      if (this.insertInstallmentData.length > 0) {
        this.loanTermVariationsData.push({
          label: 'Insert Installment',
          data: this.insertInstallmentData
        });
      }
      if (this.interestPausesData.length > 0) {
        this.loanTermVariationsData.push({
          label: 'Interest Pauses',
          data: this.interestPausesData
        });
      }
      if (this.interestRateData.length > 0) {
        this.loanTermVariationsData.push({
          label: 'Interest Rate',
          data: this.interestRateData
        });
      }
      if (this.interestRateFromInstallmentData.length > 0) {
        this.loanTermVariationsData.push({
          label: 'Interest Rate From Installment',
          data: this.interestRateFromInstallmentData
        });
      }
      if (this.principalAmountData.length > 0) {
        this.loanTermVariationsData.push({
          label: 'Principal Amount',
          data: this.principalAmountData
        });
      }
    });
  }

  manageRequest(variation: any, action: string) {
    if (action === 'Delete') {
      this.deleteInterestPause(variation);
    } else if (action === 'Edit') {
      this.updateInterestPause(variation);
    }
  }

  deleteInterestPause(variation: any) {
    const deleteStandingInstructionDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `interest pause from ${variation.startDate} to ${variation.endDate}` }
    });
    deleteStandingInstructionDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.loansService.deleteInterestPause(this.loanId, variation.id).subscribe((response: any) => {
          this.reload();
        });
      }
    });
  }

  updateInterestPause(variation: any) {
    const startDate: Date = this.dates.parseDate(variation.startDate);
    const endDate: Date = this.dates.parseDate(variation.endDate);
    const formfields: FormfieldBase[] = [
      new DatepickerBase({
        controlName: 'startDate',
        label: 'Start Date',
        value: startDate,
        maxDate: this.settingsService.maxFutureDate,
        required: true
      }),
      new DatepickerBase({
        controlName: 'endDate',
        label: 'End Date',
        value: endDate,
        maxDate: this.settingsService.maxFutureDate,
        required: true
      })

    ];

    const data = {
      title: 'Edit Interest Pause id: ' + variation.id,
      formfields: formfields,
      layout: { addButtonText: 'Submit' }
    };
    const editDialogRef = this.dialog.open(FormDialogComponent, { data, width: '50rem' });
    editDialogRef.afterClosed().subscribe((response: any) => {
      if (response.data) {
        if (response.data.value.startDate <= response.data.value.endDate) {
          const locale = this.settingsService.language.code;
          const dateFormat = this.settingsService.dateFormat;
          const payload = {
            startDate: this.dates.formatDate(response.data.value.startDate, dateFormat),
            endDate: this.dates.formatDate(response.data.value.endDate, dateFormat),
            locale,
            dateFormat
          };
          this.loansService.updateInterestPause(this.loanId, variation.id, payload).subscribe((response: any) => {
            this.reload();
          });
        }
      }
    });
  }

  private reload() {
    const url: string = this.router.url;
    this.router
      .navigateByUrl(`/clients/${this.clientId}/loans-accounts`, { skipLocationChange: true })
      .then(() => this.router.navigate([url]));
  }

  allowActions(termType: string): boolean {
    return termType === 'interestPause';
  }
}
