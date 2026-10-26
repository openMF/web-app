/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

import { AlertService } from 'app/core/alert/alert.service';
import { Dates } from 'app/core/utils/dates';
import { SettingsService } from 'app/settings/settings.service';
import { ReportsService } from '../reports.service';
import { RunReportComponent } from './run-report.component';

jest.mock('exceljs', () => ({
  Workbook: jest.fn()
}));

describe('RunReportComponent report output formats', () => {
  let component: RunReportComponent;
  let fixture: ComponentFixture<RunReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RunReportComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { params: { name: 'Client Details' } },
            queryParams: of({ type: 'Pentaho', id: 1 }),
            data: of({ reportParameters: [], configurations: { globalConfiguration: [] } })
          }
        },
        {
          provide: ReportsService,
          useValue: {
            getPentahoParams: jest.fn(() => of([])),
            getBirtParams: jest.fn(() => of([])),
            getSelectOptions: jest.fn(() => of([]))
          }
        },
        {
          provide: SettingsService,
          useValue: {
            language: { code: 'en' },
            dateFormat: 'dd MMMM yyyy',
            maxAllowedDate: new Date(2026, 0, 1)
          }
        },
        { provide: AlertService, useValue: { alert: jest.fn() } },
        { provide: TranslateService, useValue: { instant: jest.fn((key: string) => key) } },
        DatePipe,
        Dates
      ]
    })
      .overrideComponent(RunReportComponent, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(RunReportComponent);
    component = fixture.componentInstance;
  });

  it('includes XML with the existing BIRT and Pentaho output formats', () => {
    expect(component.outputTypeOptions.map((option) => option.value)).toEqual([
      'PDF',
      'HTML',
      'XLS',
      'XLSX',
      'CSV',
      'XML'
    ]);
  });

  it('serializes XML selection as output-type=XML', () => {
    component.setOutputType('XML');

    expect(component.reportForm.get('outputType')?.value).toBe('XML');
    expect(component.formatUserResponse(component.reportForm.value)).toEqual({ 'output-type': 'XML' });
  });
});
