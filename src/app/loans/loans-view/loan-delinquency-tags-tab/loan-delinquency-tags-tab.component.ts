/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Dates } from 'app/core/utils/dates';
import { LoanDelinquencyActionDialogComponent } from 'app/loans/custom-dialog/loan-delinquency-action-dialog/loan-delinquency-action-dialog.component';
import { LoansService } from 'app/loans/loans.service';
import {
  DelinquencyRangeSchedule,
  DelinquentData,
  InstallmentLevelDelinquency,
  LoanDelinquencyAction,
  LoanDelinquencyTags
} from 'app/loans/models/loan-account.model';
import { SettingsService } from 'app/settings/settings.service';
import { ConfirmationDialogComponent } from 'app/shared/confirmation-dialog/confirmation-dialog.component';
import { Currency } from 'app/shared/models/general.model';
import { NgClass, CurrencyPipe } from '@angular/common';
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
import { LoanProductBaseComponent } from 'app/products/loan-products/common/loan-product-base.component';
import { LoanDelinquencyActionRescheduleDialogComponent } from 'app/loans/custom-dialog/loan-delinquency-action-reschedule-dialog/loan-delinquency-action-reschedule-dialog.component';
import { StringEnumOptionData } from 'app/shared/models/option-data.model';
import { ProductsService } from 'app/products/products.service';

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
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoanDelinquencyTagsTabComponent extends LoanProductBaseComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private loansServices = inject(LoansService);
  private productsServices = inject(ProductsService);
  private dateUtils = inject(Dates);
  private settingsService = inject(SettingsService);
  private translateService = inject(TranslateService);
  dialog = inject(MatDialog);

  loanDelinquencyTags: LoanDelinquencyTags[] = [];
  loanDelinquencyActions: LoanDelinquencyAction[] = [];
  wcLoanDelinquencyRangeSchedule: DelinquencyRangeSchedule[] = [];
  currentLoanDelinquencyAction: LoanDelinquencyAction | null;
  currency: Currency;
  installmentLevelDelinquency: InstallmentLevelDelinquency[] = [];
  loanDelinquencyTagsColumns: string[] = [
    'classification',
    'addedOn',
    'liftedOn'
  ];
  loanDelinquencyActionsColumns: string[] = [];
  installmentDelinquencyTagsColumns: string[] = [
    'classification',
    'minimumAgeDays',
    'amount'
  ];
  loanDelinquencyRangeScheduleColumns: string[] = [
    'periodNumber',
    'fromDate',
    'toDate',
    'expectedAmount',
    'paidAmount',
    'outstandingAmount',
    'delinquentDays',
    'delinquentAmount',
    'minPaymentCriteriaMet'
  ];

  allowPause = true;
  loanId: any;
  loanProductId: any;

  locale: string;
  dateFormat: string;

  businessDate: Date | null = null;

  frequencyTypeOptions: StringEnumOptionData[] = [];
  minimumPaymentTypeOptions: StringEnumOptionData[] = [];

  constructor() {
    super();
    this.loanId = this.route.parent.parent.snapshot.params['loanId'];
    this.businessDate = this.settingsService.businessDate;

    this.route.parent.data.subscribe(
      (data: {
        loanDelinquencyTagsData: LoanDelinquencyTags[];
        loanDelinquencyData: any;
        loanDelinquencyActions: LoanDelinquencyAction[];
        wcLoanDelinquencyRangeSchedule: DelinquencyRangeSchedule[];
      }) => {
        this.loanDelinquencyTags = data.loanDelinquencyTagsData;
        this.setLoanDelinquencyAction(data.loanDelinquencyActions || []);
        const loanDelinquencyDataResponse = data.loanDelinquencyData ?? null;
        const loanDelinquencyData: DelinquentData | null = loanDelinquencyDataResponse?.delinquent || null;
        this.currency = loanDelinquencyDataResponse?.currency;
        this.installmentLevelDelinquency = [];
        if (loanDelinquencyData != null) {
          this.installmentLevelDelinquency = loanDelinquencyData.installmentLevelDelinquency || [];
        }
        if (loanDelinquencyDataResponse?.product) {
          this.loanProductId = loanDelinquencyDataResponse.product.id;
        }
        this.wcLoanDelinquencyRangeSchedule = data.wcLoanDelinquencyRangeSchedule;
      }
    );
  }

  ngOnInit(): void {
    this.locale = this.settingsService.language.code;
    this.dateFormat = this.settingsService.dateFormat;
    this.currentLoanDelinquencyAction = null;
    if (this.loanProductService.isWorkingCapital) {
      this.productsServices
        .getLoanProductsTemplate(this.loanProductService.loanProductPath)
        .subscribe((response: any) => {
          this.frequencyTypeOptions = response.periodFrequencyTypeOptions;
          this.minimumPaymentTypeOptions = response.delinquencyMinimumPaymentTypeOptions;
        });
    }

    if (this.loanProductService.isLoanProduct) {
      this.loanDelinquencyActionsColumns = [
        'identifier',
        'action',
        'startDate',
        'endDate',
        'createdOn',
        'actions'
      ];
    } else if (this.loanProductService.isWorkingCapital) {
      this.loanDelinquencyActionsColumns = [
        'identifier',
        'action',
        'startDate',
        'endDate',
        'minimumPayment',
        'frequency',
        'actions'
      ];
    }
  }

  validateDelinquencyActions(): void {
    if (this.loanDelinquencyActions.length > 0) {
      this.currentLoanDelinquencyAction = this.loanDelinquencyActions[this.loanDelinquencyActions.length - 1];
      if (this.loanProductService.isLoanProduct) {
        this.allowPause = this.currentLoanDelinquencyAction.action === 'RESUME';
      } else if (this.loanProductService.isWorkingCapital) {
        this.allowPause = true;
      }
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

      this.sendDelinquencyAction(action, startDate, endDate, null, null, null, null);
    });
  }

  createDelinquencyActionReschedule(): void {
    const action = 'reschedule';
    const loanDelinquencyActionDialogRef = this.dialog.open(LoanDelinquencyActionRescheduleDialogComponent, {
      data: {
        action: action,
        frequencyTypeOptions: this.frequencyTypeOptions,
        minimumPaymentTypeOptions: this.minimumPaymentTypeOptions
      }
    });
    loanDelinquencyActionDialogRef.afterClosed().subscribe((response: { data: any }) => {
      const minimumPayment: number = response.data.value.minimumPayment;
      const minimumPaymentType: string = response.data.value.minimumPaymentType;
      const frequency: number = response.data.value.frequency;
      const frequencyType: string = response.data.value.frequencyType;

      this.sendDelinquencyAction(action, null, null, minimumPayment, minimumPaymentType, frequency, frequencyType);
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
        this.sendDelinquencyAction('resume', null, null, null, null, null, null);
      }
    });
  }

  sendDelinquencyAction(
    action: string,
    startDate: Date | null,
    endDate: Date | null,
    minimumPayment: number | null,
    minimumPaymentType: string | null,
    frequency: number | null,
    frequencyType: string | null
  ): void {
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
    } else if (action === 'reschedule') {
      payload = {
        action,
        locale: this.locale,
        minimumPayment,
        minimumPaymentType,
        frequency,
        frequencyType
      };
    }

    this.loansServices
      .createDelinquencyActions(this.loanProductService.loanAccountPath, this.loanId, payload)
      .subscribe((result: any) => {
        this.loansServices
          .getDelinquencyActions(this.loanProductService.loanAccountPath, this.loanId)
          .subscribe((loanDelinquencyActions: LoanDelinquencyAction[]) => {
            this.setLoanDelinquencyAction(loanDelinquencyActions);
          });
      });
  }

  setLoanDelinquencyAction(loanDelinquencyActions: LoanDelinquencyAction[]): void {
    this.loanDelinquencyActions = loanDelinquencyActions || [];
    this.loanDelinquencyActions = this.loanDelinquencyActions.sort(
      (objA: LoanDelinquencyAction, objB: LoanDelinquencyAction) =>
        this.dateUtils.parseDate(objA.startDate).getTime() - this.dateUtils.parseDate(objB.startDate).getTime()
    );
    this.validateDelinquencyActions();
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
