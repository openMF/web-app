import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Dates } from 'app/core/utils/dates';
import { LoanDelinquencyActionDialogComponent } from 'app/loans/custom-dialog/loan-delinquency-action-dialog/loan-delinquency-action-dialog.component';
import { LoansService } from 'app/loans/loans.service';
import {
  DelinquentData,
  InstallmentLevelDelinquency,
  LoanDelinquencyAction,
  LoanDelinquencyTags
} from 'app/loans/models/loan-account.model';
import { SettingsService } from 'app/settings/settings.service';
import { ConfirmationDialogComponent } from 'app/shared/confirmation-dialog/confirmation-dialog.component';
import { Currency } from 'app/shared/models/general.model';
import { NgIf, NgClass, CurrencyPipe } from '@angular/common';
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
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatTooltip } from '@angular/material/tooltip';
import { DateFormatPipe } from '../../../pipes/date-format.pipe';
import { DatetimeFormatPipe } from '../../../pipes/datetime-format.pipe';
import { FormatNumberPipe } from '../../../pipes/format-number.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-loan-delinquency-tags-tab',
  templateUrl: './loan-delinquency-tags-tab.component.html',
  styleUrls: ['./loan-delinquency-tags-tab.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    FaIconComponent,
    NgClass,
    MatTooltip,
    CurrencyPipe,
    DateFormatPipe,
    DatetimeFormatPipe,
    FormatNumberPipe
  ]
})
export class LoanDelinquencyTagsTabComponent implements OnInit {
  loanDelinquencyTags: LoanDelinquencyTags[] = [];
  loanDelinquencyActions: LoanDelinquencyAction[] = [];
  currentLoanDelinquencyAction: LoanDelinquencyAction | null;
  currency: Currency;
  installmentLevelDelinquency: InstallmentLevelDelinquency[] = [];
  loanDelinquencyTagsColumns: string[] = [
    'classification',
    'addedOn',
    'liftedOn'
  ];
  loanDelinquencyActionsColumns: string[] = [
    'action',
    'startDate',
    'endDate',
    'createdOn',
    'actions'
  ];
  installmentDelinquencyTagsColumns: string[] = [
    'classification',
    'minimumAgeDays',
    'amount'
  ];

  allowPause = true;
  loanId: any;

  locale: string;
  dateFormat: string;

  constructor(
    private route: ActivatedRoute,
    private loansServices: LoansService,
    private dateUtils: Dates,
    private settingsService: SettingsService,
    private translateService: TranslateService,
    public dialog: MatDialog
  ) {
    this.loanId = this.route.parent.parent.snapshot.params['loanId'];

    this.route.parent.data.subscribe(
      (data: {
        loanDelinquencyTagsData: LoanDelinquencyTags[];
        loanDelinquencyData: any;
        loanDelinquencyActions: LoanDelinquencyAction[];
      }) => {
        this.loanDelinquencyTags = data.loanDelinquencyTagsData;
        this.loanDelinquencyActions = data.loanDelinquencyActions || [];
        this.validateDelinquencyActions();
        const loanDelinquencyData: DelinquentData | null = data.loanDelinquencyData.delinquent || null;
        this.currency = data.loanDelinquencyData.currency;
        this.installmentLevelDelinquency = [];
        if (loanDelinquencyData != null) {
          this.installmentLevelDelinquency = loanDelinquencyData.installmentLevelDelinquency || [];
        }
      }
    );
  }

  ngOnInit(): void {
    this.locale = this.settingsService.language.code;
    this.dateFormat = this.settingsService.dateFormat;
    this.currentLoanDelinquencyAction = null;
    this.validateDelinquencyActions();
  }

  validateDelinquencyActions(): void {
    if (this.loanDelinquencyActions.length > 0) {
      const businessDate: Date = this.settingsService.businessDate;
      this.currentLoanDelinquencyAction = this.loanDelinquencyActions[this.loanDelinquencyActions.length - 1];
      this.allowPause = this.currentLoanDelinquencyAction.action === 'RESUME';
    }
  }

  createDelinquencyAction(): void {
    const action = 'pause';
    const loanDelinquencyActionDialogRef = this.dialog.open(LoanDelinquencyActionDialogComponent, {
      data: {
        action: action
      }
    });
    loanDelinquencyActionDialogRef.afterClosed().subscribe((response: { data: any }) => {
      const startDate: Date = response.data.value.startDate;
      const endDate: Date = response.data.value.endDate;

      this.sendDelinquencyAction(action, startDate, endDate);
    });
  }

  resumeDelinquencyClassification(item: LoanDelinquencyAction): void {
    const removePauseDialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        heading: this.translateService.instant('labels.heading.Loan Delinquency Classification'),
        dialogContext:
          this.translateService.instant(
            'labels.dialogContext.Are you sure you want resume the Delinquency Classification for Loan'
          ) + this.loanId,
        type: 'Mild'
      }
    });
    removePauseDialogRef.afterClosed().subscribe((response: any) => {
      if (response.confirm) {
        this.sendDelinquencyAction('resume', new Date(), null);
      }
    });
  }

  sendDelinquencyAction(action: string, startDate: Date, endDate: Date): void {
    let payload: any = {
      action,
      locale: this.locale,
      dateFormat: this.dateFormat,
      startDate: this.dateUtils.formatDate(startDate, this.dateFormat)
    };
    if (action === 'pause') {
      payload = {
        action,
        locale: this.locale,
        dateFormat: this.dateFormat,
        startDate: this.dateUtils.formatDate(startDate, this.dateFormat),
        endDate: this.dateUtils.formatDate(endDate, this.dateFormat)
      };
    }

    this.loansServices.createDelinquencyActions(this.loanId, payload).subscribe((result: any) => {
      this.loansServices
        .getDelinquencyActions(this.loanId)
        .subscribe((loanDelinquencyActions: LoanDelinquencyAction[]) => {
          this.loanDelinquencyActions = loanDelinquencyActions;
          this.validateDelinquencyActions();
        });
    });
  }

  isCurrentAndPauseAction(item: LoanDelinquencyAction): boolean {
    if (this.currentLoanDelinquencyAction != null) {
      if (this.currentLoanDelinquencyAction.id === item.id) {
        if (item.action === 'PAUSE') {
          const businessDate: Date = this.settingsService.businessDate;
          const startDate: Date = this.dateUtils.parseDate(item.startDate);
          if (businessDate < startDate) {
            this.allowPause = true;
            return false;
          }
          if (item.endDate) {
            const endDate: Date = this.dateUtils.parseDate(item.endDate);
            if (businessDate > endDate) {
              this.allowPause = true;
              return false;
            }
          }
          return true;
        }
      }
    }
    return false;
  }

  actionClass(action: string): string {
    if (action === 'PAUSE') {
      return 'status-pending';
    }
    return 'status-active';
  }
}
