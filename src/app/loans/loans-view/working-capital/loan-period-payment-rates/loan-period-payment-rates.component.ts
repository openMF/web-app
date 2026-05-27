/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Component, inject, OnInit } from '@angular/core';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
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
import { FormatNumberPipe } from '@pipes/format-number.pipe';
import { ActivatedRoute } from '@angular/router';
import { PeriodPaymentRateChange } from 'app/loans/models/working-capital-loan-account.model';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { LoansService } from 'app/loans/loans.service';
import { SettingsService } from 'app/settings/settings.service';
import { FormfieldBase } from 'app/shared/form-dialog/formfield/model/formfield-base';
import { FormDialogComponent } from 'app/shared/form-dialog/form-dialog.component';
import { InputBase } from 'app/shared/form-dialog/formfield/model/input-base';

@Component({
  selector: 'mifosx-loan-period-payment-rates',
  templateUrl: './loan-period-payment-rates.component.html',
  styleUrl: './loan-period-payment-rates.component.scss',
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
    FormatNumberPipe
  ]
})
export class LoanPeriodPaymentRatesComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private dialog = inject(MatDialog);
  private translateService = inject(TranslateService);
  private loanService = inject(LoansService);
  private settingsService = inject(SettingsService);

  loanPaymentRatesData: PeriodPaymentRateChange[] = [];

  loanId: number | null = null;

  loanPaymentRatesColumns: string[] = [
    'id',
    'effectiveDate',
    'previousRate',
    'newRate',
    'createdDate'
  ];

  constructor() {}

  ngOnInit(): void {
    this.loanId = this.route.parent.snapshot.params['loanId'];

    this.route.data.subscribe((data: { loanPaymentRatesData: PeriodPaymentRateChange[] }) => {
      this.loanPaymentRatesData = data.loanPaymentRatesData;
    });
  }

  addPaymentRate(): void {
    const labelHeadingText: string = this.translateService.instant('labels.inputs.Period Payment Rate');
    const formfields: FormfieldBase[] = [
      new InputBase({
        controlName: 'periodPaymentRate',
        label: labelHeadingText,
        value: '',
        type: 'number',
        required: true,
        order: 1
      }),
      new InputBase({
        controlName: 'note',
        label: this.translateService.instant('labels.inputs.Note'),
        value: '',
        type: 'text',
        required: false,
        order: 2
      })
    ];
    const data = {
      title: this.translateService.instant('labels.buttons.Add') + ' ' + labelHeadingText,
      layout: { addButtonText: this.translateService.instant('labels.buttons.Add') },
      formfields: formfields
    };
    const dialogRef = this.dialog.open(FormDialogComponent, { data });
    dialogRef.afterClosed().subscribe((response: any) => {
      if (response?.data) {
        const { periodPaymentRate, note } = response.data.value;
        const payload = {
          periodPaymentRate: periodPaymentRate,
          note: note || '',
          locale: this.settingsService.language.code
        };
        this.loanService.addWorkingCapitalPeriodPaymentRate(this.loanId, payload).subscribe((response: any) => {
          this.loanService.getWorkingCapitalPeriodPaymentRates(this.loanId).subscribe((data: any) => {
            this.loanPaymentRatesData = data;
          });
        });
      }
    });
  }

  periodPaymentRateStyle(reversed: boolean): string {
    return reversed ? 'reversed' : '';
  }
}
