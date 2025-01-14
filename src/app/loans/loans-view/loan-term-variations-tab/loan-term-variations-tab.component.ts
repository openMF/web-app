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

@Component({
  selector: 'mifosx-loan-term-variations-tab',
  templateUrl: './loan-term-variations-tab.component.html',
  styleUrls: ['./loan-term-variations-tab.component.scss']
})
export class LoanTermVariationsTabComponent {
  /** Loan Term Variation Data */
  loanTermVariationsData: any[] = [];
  loanDTermVariationsColumns: string[] = [
    'termType',
    'applicableFrom',
    'value',
    'specificToInstallment'
  ];
  /** Interest Pauses Data */
  interestPausesData: any[] = [];
  interestPausesColumns: string[] = [
    'row',
    'startDate',
    'endDate',
    'days',
    'actions'
  ];

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
    this.route.data.subscribe((data: { loanDetailsData: any; interestPausesData: any }) => {
      this.loanId = data.loanDetailsData.id;
      this.loanTermVariationsData = data.loanDetailsData.loanTermVariations;
      this.interestPausesData = [];
      data.interestPausesData?.forEach((item: any) => {
        item.days = dates.calculateDiff(new Date(item.startDate), new Date(item.endDate));
        this.interestPausesData.push(item);
      });
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
}
