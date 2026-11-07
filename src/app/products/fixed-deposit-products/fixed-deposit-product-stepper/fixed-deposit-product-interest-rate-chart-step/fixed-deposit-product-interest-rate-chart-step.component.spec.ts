/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { UntypedFormArray, UntypedFormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatStepperModule, MatStepper } from '@angular/material/stepper';
import { provideNativeDateAdapter } from '@angular/material/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { of, Subject } from 'rxjs';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { By } from '@angular/platform-browser';
import { CdkStepper } from '@angular/cdk/stepper';

import { Dates } from 'app/core/utils/dates';
import { SettingsService } from 'app/settings/settings.service';
import { Accounting } from 'app/core/utils/accounting';
import { ProductsService } from 'app/products/products.service';
import { getDepositProductChartSlabsErrorKey } from 'app/products/deposit-product-interest-rate-chart.util';
import { CreateFixedDepositProductComponent } from '../../create-fixed-deposit-product/create-fixed-deposit-product.component';
import { EditFixedDepositProductComponent } from '../../edit-fixed-deposit-product/edit-fixed-deposit-product.component';
import { FixedDepositProductInterestRateChartStepComponent } from './fixed-deposit-product-interest-rate-chart-step.component';

function template(persisted = true) {
  const periods = [
    [
      1,
      29,
      8
    ],
    [
      30,
      59,
      8.25
    ],
    [
      60,
      89,
      8.75
    ],
    [
      90,
      179,
      9.25
    ],
    [
      180,
      359,
      10
    ],
    [
      360,
      undefined,
      11.25
    ]
  ];
  return {
    chartTemplate: {
      periodTypes: [{ id: 0, value: 'Days' }],
      entityTypeOptions: [{ id: 1 }],
      attributeNameOptions: [] as unknown[],
      conditionTypeOptions: [] as unknown[],
      genderOptions: [] as unknown[],
      clientTypeOptions: [] as unknown[],
      clientClassificationOptions: [] as unknown[],
      incentiveTypeOptions: [] as unknown[]
    },
    ...(persisted
      ? {
          activeChart: {
            id: 7,
            name: 'RANGO1',
            description: 'RANGO1',
            fromDate: [
              2026,
              7,
              1
            ],
            isPrimaryGroupingByAmount: true,
            chartSlabs: [
              {
                id: 2,
                description: 'PAGARE',
                periodType: { id: 0 },
                amountRangeFrom: 1,
                amountRangeTo: 999,
                fromPeriod: 1,
                annualInterestRate: 8
              },
              ...periods.map(
                ([
                    fromPeriod,
                    toPeriod,
                    annualInterestRate
                  ], index) => ({
                  id: index + 3,
                  description: `PAGARE${index + 1}`,
                  periodType: { id: 0 },
                  amountRangeFrom: 1000,
                  amountRangeTo: 9999,
                  fromPeriod,
                  toPeriod,
                  annualInterestRate
                })
              )
            ]
          }
        }
      : {})
  };
}

function configure() {
  TestBed.configureTestingModule({
    imports: [
      TranslateModule.forRoot(),
      NoopAnimationsModule
    ],
    providers: [
      provideNativeDateAdapter(),
      { provide: CdkStepper, useValue: { next: jest.fn(), previous: jest.fn() } },
      { provide: MatDialog, useValue: { open: jest.fn(() => ({ afterClosed: () => of({}) })) } },
      { provide: Dates, useValue: { parseDate: () => new Date(2026, 6, 1), formatDateAsString: () => '2026-07-01' } },
      { provide: SettingsService, useValue: { language: { code: 'en' } } }
    ]
  });
}

function initialize() {
  TestBed.inject(FaIconLibrary).addIconPacks(fas);
  const translate = TestBed.inject(TranslateService);
  translate.setTranslation(
    'en-US',
    JSON.parse(readFileSync(join(process.cwd(), 'src/assets/translations/en-US.json'), 'utf8'))
  );
  translate.use('en-US');
}

function createChart(persisted = true) {
  const fixture = TestBed.createComponent(FixedDepositProductInterestRateChartStepComponent);
  const data = template(persisted);
  fixture.componentRef.setInput('fixedDepositProductsTemplate', data);
  fixture.detectChanges();
  return {
    fixture,
    component: fixture.componentInstance,
    data,
    slabs: fixture.componentInstance.charts.at(0).get('chartSlabs') as UntypedFormArray
  };
}

describe('WEB-1365 fixed deposit interest chart', () => {
  beforeEach(() => {
    configure();
    initialize();
  });

  it('loads persisted slabs once, keeps IDs and omitted bounds, and renders no false error', () => {
    const { fixture, component, slabs, data } = createChart();
    expect(slabs.length).toBe(7);
    expect(component.fixedDepositProductInterestRateChartForm.valid).toBe(true);
    expect(fixture.nativeElement.querySelector('mat-error')).toBeNull();
    const payload = component.fixedDepositProductInterestRateChart;
    expect(payload.charts[0].id).toBe(7);
    expect(payload.charts[0].chartSlabs.map((slab: { id: number }) => slab.id)).toEqual([
      2,
      3,
      4,
      5,
      6,
      7,
      8
    ]);
    expect(payload.charts[0].chartSlabs[0]).not.toHaveProperty('toPeriod');
    expect(payload.charts[0].chartSlabs[6]).not.toHaveProperty('toPeriod');
    expect(data.activeChart.chartSlabs[0].periodType).toEqual({ id: 0 });
    expect(data.activeChart.fromDate).toEqual([
      2026,
      7,
      1
    ]);
  });

  it('renders a localized genuine overlap and clears it when corrected', () => {
    const { fixture, component, slabs } = createChart();
    slabs.at(1).patchValue({ toPeriod: 40 });
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    expect(component.fixedDepositProductInterestRateChartForm.invalid).toBe(true);
    expect(fixture.nativeElement.querySelector('mat-error').textContent.trim()).toBe(
      'Interest rate slabs overlap. Please adjust the amount or period ranges.'
    );
    slabs.at(1).patchValue({ toPeriod: 29 });
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('mat-error')).toBeNull();
    expect(component.fixedDepositProductInterestRateChartForm.valid).toBe(true);
  });

  it('edits a saved row in place without self-conflict and restores unchanged values on cancel', () => {
    const { component, slabs } = createChart();
    const dialog = TestBed.inject(MatDialog);
    jest.spyOn(dialog, 'open').mockReturnValueOnce({
      afterClosed: () => of({ data: new UntypedFormBuilder().group({ annualInterestRate: 8.1 }) })
    } as never);
    component.editChartSlab(slabs, 1);
    expect(slabs.length).toBe(7);
    expect(slabs.at(1).value.id).toBe(3);
    expect(slabs.at(1).value.annualInterestRate).toBe(8.1);
    expect(slabs.errors).toBeNull();
    const before = slabs.value;
    jest.spyOn(dialog, 'open').mockReturnValueOnce({ afterClosed: () => of(undefined) } as never);
    component.editChartSlab(slabs, 1);
    expect(slabs.value).toEqual(before);
  });

  it('revalidates after add/delete and ignores cancelled dialogs', () => {
    const { component, slabs } = createChart();
    const dialog = TestBed.inject(MatDialog);
    const duplicate = new UntypedFormBuilder().group({ ...slabs.at(1).value });
    jest.spyOn(dialog, 'open').mockReturnValueOnce({ afterClosed: () => of({ data: duplicate }) } as never);
    component.addChartSlab(slabs);
    expect(slabs.hasError('slabRange')).toBe(true);
    jest.spyOn(dialog, 'open').mockReturnValueOnce({ afterClosed: () => of({ delete: true }) } as never);
    component.delete(slabs, 7);
    expect(slabs.errors).toBeNull();
    jest.spyOn(dialog, 'open').mockReturnValueOnce({ afterClosed: () => of(undefined) } as never);
    component.addChartSlab(slabs);
    expect(slabs.length).toBe(7);
    jest.spyOn(dialog, 'open').mockReturnValueOnce({ afterClosed: () => of(undefined) } as never);
    component.delete(slabs, 1);
    expect(slabs.length).toBe(7);
  });

  it('revalidates when grouping changes and when earlier charts have been removed', () => {
    const { component, slabs } = createChart();
    const chart = component.charts.at(0);
    chart.get('isPrimaryGroupingByAmount').setValue(false);
    expect(slabs.hasError('slabRange')).toBe(true); // Distinct period-first groups intersect.
    chart.get('isPrimaryGroupingByAmount').setValue(true);
    expect(slabs.errors).toBeNull();
    component.addChart();
    const remaining = component.charts.at(1);
    component.charts.removeAt(0);
    expect(() => remaining.get('isPrimaryGroupingByAmount').setValue(true)).not.toThrow();
    expect(component.chartSlabsDisplayedColumns[0][0]).toBe('amountRange');
  });

  it('preserves zero bounds, incentive IDs and incentive terms on load and submission', () => {
    const fixture = TestBed.createComponent(FixedDepositProductInterestRateChartStepComponent);
    const data = template();
    const incentive = {
      id: 15,
      amount: 0.5,
      attributeName: 1,
      attributeValue: 1,
      conditionType: 1,
      entityType: 1,
      incentiveType: 1
    };
    const chartSlabs = [
      { ...data.activeChart.chartSlabs[0], amountRangeFrom: 0, fromPeriod: 0, toPeriod: 0, incentives: [incentive] }
    ];
    fixture.componentRef.setInput('fixedDepositProductsTemplate', {
      ...data,
      activeChart: { ...data.activeChart, chartSlabs }
    });
    fixture.detectChanges();
    const slab = fixture.componentInstance.fixedDepositProductInterestRateChart.charts[0].chartSlabs[0];
    expect(slab).toEqual(
      expect.objectContaining({ amountRangeFrom: 0, fromPeriod: 0, toPeriod: 0, incentives: [incentive] })
    );
  });

  it('starts Create empty and becomes valid once a complete chart and slab are added', () => {
    const { component, slabs } = createChart(false);
    expect(component.fixedDepositProductInterestRateChartForm.invalid).toBe(true);
    component.charts.at(0).patchValue({ name: 'Chart', description: 'Chart', fromDate: new Date(2026, 6, 1) });
    slabs.push(
      new UntypedFormBuilder().group({
        periodType: 0,
        fromPeriod: 1,
        toPeriod: 29,
        annualInterestRate: 8,
        description: 'Rate'
      })
    );
    expect(component.fixedDepositProductInterestRateChartForm.valid).toBe(true);
  });
});

describe('WEB-1365 localized validation keys', () => {
  beforeEach(() => {
    configure();
    initialize();
  });
  const locales = readdirSync(join(process.cwd(), 'src/assets/translations')).filter((file) => file.endsWith('.json'));
  it.each(locales)('resolves every slab error for %s through TranslateService without fallback', (file) => {
    const translate = TestBed.inject(TranslateService);
    const locale = file.replace('.json', '');
    translate.setTranslation(
      locale,
      JSON.parse(readFileSync(join(process.cwd(), 'src/assets/translations', file), 'utf8'))
    );
    translate.use(locale);
    for (const type of [
      'gap',
      'overlap',
      'invalidRange',
      'openEndedRange',
      'missingAmountRangeFrom',
      'periodTypeMismatch'
    ]) {
      for (const product of [
        'fixeddeposit',
        'recurringdeposit'
      ] as const) {
        const key = getDepositProductChartSlabsErrorKey({ slabRange: { type } }, product);
        expect(translate.instant(key)).not.toBe(key);
        expect(translate.instant(key)).toBeTruthy();
      }
    }
  });
});

// Use each real container's chart/form getters with a focused Material stepper template.
// Other product steps are already complete; no backend writes are performed.
describe.each([
  CreateFixedDepositProductComponent,
  EditFixedDepositProductComponent
])('WEB-1365 %p chart navigation', (container) => {
  beforeEach(() => {
    configure();
    const data = template();
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { data: of({ fixedDepositProductsTemplate: data, fixedDepositProductAndTemplate: data }) }
        },
        { provide: Router, useValue: { navigate: jest.fn() } },
        { provide: Accounting, useValue: { getAccountingRulesForSavings: (): string[] => [] } },
        { provide: ProductsService, useValue: {} }
      ]
    });
    TestBed.overrideComponent(container, {
      set: {
        imports: [
          MatStepperModule,
          FixedDepositProductInterestRateChartStepComponent
        ],
        template: `<mat-stepper [linear]="false">
        <mat-step [stepControl]="fixedDepositProductInterestRateChartForm">
          <mifosx-fixed-deposit-product-interest-rate-chart-step [fixedDepositProductsTemplate]="fixedDepositProductsTemplate" />
        </mat-step><mat-step>Charges</mat-step>
      </mat-stepper><span data-testid="chart-valid">{{ fixedDepositProductInterestRateChartForm?.valid }}</span>`
      }
    });
    initialize();
  });

  it('navigates valid saved data and blocks final form validity until a true overlap is corrected', () => {
    const fixture = TestBed.createComponent<CreateFixedDepositProductComponent | EditFixedDepositProductComponent>(
      container
    );
    fixture.detectChanges();
    for (const step of [
      'Details',
      'Currency',
      'Terms',
      'Settings',
      'Accounting'
    ]) {
      Object.assign(fixture.componentInstance, {
        [`fixedDepositProduct${step}Step`]: { [`fixedDepositProduct${step}Form`]: new UntypedFormBuilder().group({}) }
      });
    }
    const isProductValid = () =>
      fixture.componentInstance instanceof CreateFixedDepositProductComponent
        ? fixture.componentInstance.fixedDepositProductFormValid
        : fixture.componentInstance.fixedDepositProductFormValidAndNotPrinstine;
    const stepper = fixture.debugElement.query(By.directive(MatStepper)).componentInstance as MatStepper;
    const chart = fixture.componentInstance.fixedDepositProductInterestRateChartStep;
    const slabs = chart.charts.at(0).get('chartSlabs') as UntypedFormArray;
    expect(fixture.componentInstance.fixedDepositProductInterestRateChartForm.valid).toBe(true);
    stepper.next();
    expect(stepper.selectedIndex).toBe(1);
    stepper.previous();
    slabs.at(1).patchValue({ toPeriod: 40 });
    fixture.detectChanges();
    stepper.next();
    expect(stepper.selectedIndex).toBe(1);
    expect(isProductValid()).toBe(false);
    stepper.previous();
    slabs.at(1).patchValue({ toPeriod: 29 });
    expect(isProductValid()).toBe(true);
    stepper.next();
    expect(stepper.selectedIndex).toBe(1);
  });
  it('notifies the OnPush parent when a slab dialog changes chart validity', async () => {
    const fixture = TestBed.createComponent<CreateFixedDepositProductComponent | EditFixedDepositProductComponent>(
      container
    );
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const status = () => fixture.nativeElement.querySelector('[data-testid="chart-valid"]').textContent.trim();
    expect(status()).toBe('true');
    const chart = fixture.componentInstance.fixedDepositProductInterestRateChartStep;
    const slabs = chart.charts.at(0).get('chartSlabs') as UntypedFormArray;
    const closed = new Subject<{ data: ReturnType<UntypedFormBuilder['group']> }>();
    jest.spyOn(TestBed.inject(MatDialog), 'open').mockReturnValue({ afterClosed: () => closed } as never);
    chart.editChartSlab(slabs, 1);
    closed.next({ data: new UntypedFormBuilder().group({ toPeriod: 40 }) });
    await fixture.whenStable();
    expect(status()).toBe('false');
    closed.next({ data: new UntypedFormBuilder().group({ toPeriod: 29 }) });
    await fixture.whenStable();
    expect(status()).toBe('true');
    closed.complete();
  });
});
