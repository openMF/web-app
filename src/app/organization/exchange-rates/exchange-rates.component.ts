/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  OnInit,
  ViewChild,
  inject
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltip } from '@angular/material/tooltip';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { take } from 'rxjs';

import { AlertService } from 'app/core/alert/alert.service';
import { Dates } from 'app/core/utils/dates';
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';
import { Currency } from 'app/shared/models/general.model';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

import { ExchangeRate, ExchangeRateFilters } from './exchange-rate.model';
import {
  resolveCurrencyOptions,
  resolveSourceCurrencyCode,
  resolveTargetCurrencyCode
} from './exchange-rate-form.util';
import { ExchangeRatesService } from './exchange-rates.service';

@Component({
  selector: 'mifosx-exchange-rates',
  templateUrl: './exchange-rates.component.html',
  styleUrls: ['./exchange-rates.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent,
    MatTableModule,
    MatSortModule,
    MatTooltip,
    MatPaginatorModule,
    ReactiveFormsModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExchangeRatesComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private formBuilder = inject(FormBuilder);
  private exchangeRatesService = inject(ExchangeRatesService);
  private dateUtils = inject(Dates);
  private dialog = inject(MatDialog);
  private alertService = inject(AlertService);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  exchangeRatesData: ExchangeRate[] = [];
  currencyOptions: Currency[] = [];
  loading = false;
  displayedColumns: string[] = [
    'sourceCurrency',
    'targetCurrency',
    'buyIndicatorCode',
    'sellIndicatorCode',
    'buyRate',
    'sellRate',
    'referenceRate',
    'rateDate',
    'latest',
    'actions'
  ];
  dataSource = new MatTableDataSource<ExchangeRate>([]);
  filterForm = this.formBuilder.group({
    sourceCurrency: [''],
    targetCurrency: [''],
    latest: [''],
    rateDate: ['']
  });

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor() {
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data) => {
      this.exchangeRatesData = this.normalizeExchangeRates(data.exchangeRates);
      this.currencyOptions = resolveCurrencyOptions(data.currencies);
    });
  }

  ngOnInit() {
    this.setExchangeRates();
  }

  applyFilters() {
    const filterValue = this.filterForm.value;
    const filters: ExchangeRateFilters = {
      sourceCurrency: filterValue.sourceCurrency,
      targetCurrency: filterValue.targetCurrency,
      latest: filterValue.latest,
      rateDate: filterValue.rateDate ? this.dateUtils.formatDate(filterValue.rateDate, 'yyyy-MM-dd') : ''
    };

    this.loading = true;
    this.exchangeRatesService
      .getExchangeRates(filters)
      .pipe(take(1))
      .subscribe({
        next: (exchangeRates) => {
          this.exchangeRatesData = this.normalizeExchangeRates(exchangeRates);
          this.setExchangeRates();
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.loading = false;
          this.cdr.markForCheck();
        }
      });
  }

  resetFilters() {
    this.filterForm.reset({
      sourceCurrency: '',
      targetCurrency: '',
      latest: '',
      rateDate: ''
    });
    this.applyFilters();
  }

  setExchangeRates() {
    this.dataSource = new MatTableDataSource(this.exchangeRatesData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = (exchangeRate: ExchangeRate, property: string): string | number => {
      switch (property) {
        case 'sourceCurrency':
          return this.getSourceCurrencyCode(exchangeRate);
        case 'targetCurrency':
          return this.getTargetCurrencyCode(exchangeRate);
        case 'latest':
          return exchangeRate.latest ? 1 : 0;
        case 'buyRate':
        case 'sellRate':
        case 'referenceRate':
          return (exchangeRate as any)[property] || 0;
        default:
          return (exchangeRate as any)[property];
      }
    };
  }

  deleteExchangeRate(exchangeRate: ExchangeRate) {
    const exchangeRateId = exchangeRate.id;
    if (!exchangeRateId) {
      this.alertService.alert({ type: 'Error', message: 'Exchange rate id is missing.' });
      return;
    }

    const deleteExchangeRateDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `exchange rate ${exchangeRateId}` }
    });
    deleteExchangeRateDialogRef.afterClosed().subscribe((response?: { delete?: boolean }) => {
      if (response?.delete) {
        this.exchangeRatesService
          .deleteExchangeRate(exchangeRateId)
          .pipe(take(1))
          .subscribe(() => {
            this.exchangeRatesData = this.exchangeRatesData.filter((rate) => rate.id !== exchangeRateId);
            this.setExchangeRates();
            this.cdr.markForCheck();
          });
      }
    });
  }

  getSourceCurrencyCode(exchangeRate: ExchangeRate): string {
    return resolveSourceCurrencyCode(exchangeRate);
  }

  getTargetCurrencyCode(exchangeRate: ExchangeRate): string {
    return resolveTargetCurrencyCode(exchangeRate);
  }

  private normalizeExchangeRates(exchangeRates: ExchangeRate[] | { pageItems?: ExchangeRate[] }): ExchangeRate[] {
    if (Array.isArray(exchangeRates)) {
      return exchangeRates;
    }
    return exchangeRates?.pageItems || [];
  }
}
