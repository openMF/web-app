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
import { BehaviorSubject, of, Subject } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ReportParameter } from '../common-models/report-parameter.model';

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
  let route: any;

  beforeEach(async () => {
    route = {
      snapshot: { params: { name: 'Client Details' } },
      queryParams: new BehaviorSubject({ type: 'Pentaho', id: 1 }),
      data: new BehaviorSubject({ reportParameters: [], configurations: { globalConfiguration: [] } })
    };
    await TestBed.configureTestingModule({
      imports: [
        RunReportComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: route
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

  function openClientReport(name = 'Tabla de Amortización Personal back to back', type = 'BIRT'): ReportParameter {
    const parameter = new ReportParameter([
      'DefaultClient',
      'clientId',
      'Client',
      'none',
      'number',
      -1,
      '',
      '',
      null
    ]);
    route.snapshot.params.name = name;
    route.queryParams.next({ type, id: 206 });
    route.data.next({ reportParameters: [parameter], configurations: { globalConfiguration: [] } });
    return parameter;
  }

  it('exposes DefaultClient without changing the resolver data or database definition', () => {
    const original = openClientReport();
    expect(original.displayType).toBe('none');
    expect(original.label).toBe('Client');
    expect(component.paramData[0].displayType).toBe('text');
    component.reportForm.get('DefaultClient')?.setValue('6086');
    expect(component.formatUserResponse(component.reportForm.value)).toEqual({
      R_clientId: '6086',
      'output-type': 'PDF'
    });
    expect(component.outputTypeOptions.map((option) => option.value)).toEqual(['PDF']);
  });

  it('retains the client key when the BIRT mapping uses another name', () => {
    const mappings = new Subject<any[]>();
    const service = TestBed.inject(ReportsService);
    (service.getBirtParams as jest.Mock).mockReturnValueOnce(mappings);
    openClientReport();
    mappings.next([{ parameterName: 'DefaultClient', reportParameterName: 'otherClient' }]);
    component.reportForm.get('DefaultClient')?.setValue('6086');
    expect(component.formatUserResponse(component.reportForm.value).R_clientId).toBe('6086');
    expect(component.paramData[0].pentahoName).toBe('R_clientId');
  });

  it('keeps late mappings attached to their original report after route reuse', () => {
    const older = new Subject<any[]>();
    const current = new Subject<any[]>();
    const service = TestBed.inject(ReportsService);
    (service.getBirtParams as jest.Mock).mockReturnValueOnce(older).mockReturnValueOnce(current);
    openClientReport();
    const previousParameter = component.paramData[0];
    openClientReport('Client Details');
    current.next([{ parameterName: 'DefaultClient', reportParameterName: 'currentClient' }]);
    older.next([{ parameterName: 'DefaultClient', reportParameterName: 'olderClient' }]);
    expect(component.paramData[0].pentahoName).toBe('R_currentClient');
    expect(previousParameter.pentahoName).toBe('R_clientId');
  });

  it.each([
    '0',
    '-1',
    '1.5',
    'abc',
    '   ',
    '000'
  ])('rejects invalid client identifier %s', (value) => {
    openClientReport();
    component.reportForm.get('DefaultClient')?.setValue(value);
    component.run();
    expect(component.reportForm.invalid).toBe(true);
    expect(component.isCollapsed).toBe(false);
  });

  it('accepts positive integer input and enforces PDF at submission', () => {
    openClientReport();
    component.reportForm.get('DefaultClient')?.setValue('0006086');
    component.setOutputType('XLS');
    expect(component.reportForm.get('outputType')?.value).toBe('PDF');
    component.reportForm.get('outputType')?.setValue('XLS');
    component.run();
    expect(component.dataObject.formData['output-type']).toBe('PDF');
    expect(component.dataObject.formData.R_clientId).toBe('0006086');
  });

  it.each([
    [
      'Client Details',
      'BIRT'
    ],
    [
      'Tabla de Amortización Personal back to back',
      'Table'
    ],
    [
      'Tabla de Amortización Personal back to back',
      'Pentaho'
    ]
  ])('preserves hidden parameters for %s (%s)', (name, type) => {
    openClientReport(name, type);
    expect(component.paramData[0].displayType).toBe('none');
    expect(component.isClientReport()).toBe(false);
  });

  it('restores the form and retains a client error when Angular reattaches the control', async () => {
    openClientReport();
    const control = component.reportForm.get('DefaultClient');
    control?.setValue('999999');
    component.run();
    await component.handleBirtError(
      new HttpErrorResponse({
        status: 400,
        error: {
          errors: [{ userMessageGlobalisationCode: 'error.msg.birt.client.not.found' }]
        }
      })
    );
    expect(component.isCollapsed).toBe(false);
    expect(component.hideBirt).toBe(true);
    control?.updateValueAndValidity({ emitEvent: false });
    expect(control?.hasError('birtValidation')).toBe(true);
    expect(control?.touched).toBe(true);
    expect(component.clientReportError).toBe('reports.client.notFound');
    control?.setValue('6086');
    expect(control?.valid).toBe(true);
    expect(component.clientReportError).toBeNull();
  });

  it('does not label an authorization failure as an invalid client', async () => {
    openClientReport();
    component.reportForm.get('DefaultClient')?.setValue('6086');
    await component.handleBirtError(
      new HttpErrorResponse({
        status: 403,
        error: {
          errors: [{ userMessageGlobalisationCode: 'error.msg.birt.client.not.found' }]
        }
      })
    );
    expect(component.clientReportError).toBeNull();
    expect(component.reportForm.get('DefaultClient')?.hasError('birtValidation')).toBe(false);
  });

  it('decodes validation errors delivered as an ArrayBuffer by the report endpoint', async () => {
    openClientReport();
    component.reportForm.get('DefaultClient')?.setValue('6089');
    const error = new TextEncoder().encode(
      JSON.stringify({
        errors: [{ userMessageGlobalisationCode: 'error.msg.birt.client.no.loans' }]
      })
    ).buffer;
    await component.handleBirtError(new HttpErrorResponse({ status: 400, error }));
    expect(component.clientReportError).toBe('reports.client.noLoans');
    expect(component.reportForm.get('DefaultClient')?.hasError('birtValidation')).toBe(true);
  });
});
