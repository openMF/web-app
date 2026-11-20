/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject, of, Subject, throwError } from 'rxjs';
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { LegalFormId } from 'app/clients/models/legal-form.enum';
import { ClientsService } from 'app/clients/clients.service';
import { ReportsService } from 'app/reports/reports.service';
import { SettingsService } from 'app/settings/settings.service';
import { AlertService } from 'app/core/alert/alert.service';
import { SystemService } from 'app/system/system.service';
import { PersonalDataViewService } from './personal-data-view.service';
import { PersonalDataTabComponent } from './personal-data-tab.component';
import { IdentitiesTabComponent } from '../identities-tab/identities-tab.component';
import { DocumentsTabComponent } from '../documents-tab/documents-tab.component';
import { HttpHeaders, HttpResponse } from '@angular/common/http';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import * as downloads from 'app/core/utils/file-download.utils';
import { environment } from 'environments/environment';

@Component({
  selector: 'mifosx-identities-tab',
  standalone: true,
  template: ''
})
class IdentitiesTabStubComponent {}

@Component({
  selector: 'mifosx-documents-tab',
  standalone: true,
  template: ''
})
class DocumentsTabStubComponent {}

describe('PersonalDataTabComponent', () => {
  let fixture: ComponentFixture<PersonalDataTabComponent>;
  let routeData: BehaviorSubject<any>;
  let personalDataViewService: jest.Mocked<PersonalDataViewService>;
  const originalPrivacy = environment.complianceHideClientData;
  let configurations: Subject<any> | null = null;
  const originalProductionMode = environment.productionMode;

  const baseClient = {
    id: 1,
    accountNo: '0001',
    displayName: 'Client One',
    officeName: 'Head Office',
    legalForm: {
      id: LegalFormId.PERSON,
      code: 'legalFormType.person',
      value: 'Person'
    },
    status: {
      value: 'Active'
    }
  };

  function setup(productionMode: boolean, legalFormId: number | string = LegalFormId.PERSON, legalFormValue?: string) {
    environment.productionMode = productionMode;
    const normalizedLegalFormId = Number(legalFormId);
    routeData = new BehaviorSubject({
      clientViewData: {
        ...baseClient,
        legalForm: {
          ...baseClient.legalForm,
          id: legalFormId,
          code: normalizedLegalFormId === LegalFormId.ENTITY ? 'legalFormType.entity' : 'legalFormType.person',
          value: legalFormValue || (normalizedLegalFormId === LegalFormId.ENTITY ? 'Entity' : 'Person')
        }
      },
      clientDatatables: [{ registeredTableName: 'client_socioeconomic_information' }]
    });
    personalDataViewService = {
      load: jest.fn(() =>
        of({
          addresses: [],
          familyMembers: [],
          identifiers: [],
          documents: [],
          datatableSections: {}
        })
      )
    } as unknown as jest.Mocked<PersonalDataViewService>;

    TestBed.configureTestingModule({
      imports: [
        PersonalDataTabComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            parent: {
              data: routeData.asObservable()
            },
            data: of({ clientIdentities: [] })
          }
        },
        {
          provide: ClientsService,
          useValue: {
            getClientDatatable: jest.fn(() => of({ data: [] }))
          }
        },
        {
          provide: AuthenticationService,
          useValue: { getCredentials: jest.fn(() => ({ permissions: ['ALL_FUNCTIONS_READ'] })) }
        },
        {
          provide: ReportsService,
          useValue: {
            getPentahoRunReportData: jest.fn(() =>
              of(
                new HttpResponse({
                  body: new Uint8Array([
                    37,
                    80,
                    68,
                    70,
                    45,
                    49,
                    46,
                    55
                  ]).buffer,
                  headers: new HttpHeaders({ 'Content-Type': 'application/pdf' })
                })
              )
            )
          }
        },
        {
          provide: SettingsService,
          useValue: { tenantIdentifier: 'default', language: { code: 'en' }, dateFormat: 'dd MMMM yyyy' }
        },
        { provide: AlertService, useValue: { alert: jest.fn() } },
        {
          provide: SystemService,
          useValue: {
            getConfigurations: jest.fn(
              () => configurations || of({ globalConfiguration: [{ name: 'enable-kyc-validation', enabled: true }] })
            )
          }
        },
        { provide: MatDialog, useValue: { open: jest.fn() } },
        { provide: PersonalDataViewService, useValue: personalDataViewService },
        DatePipe,
        provideNoopAnimations()
      ]
    }).overrideComponent(PersonalDataTabComponent, {
      remove: { imports: [
          IdentitiesTabComponent,
          DocumentsTabComponent
        ] },
      add: { imports: [
          IdentitiesTabStubComponent,
          DocumentsTabStubComponent
        ] }
    });

    fixture = TestBed.createComponent(PersonalDataTabComponent);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  beforeEach(() => {
    URL.createObjectURL = jest.fn(() => 'blob:kyc-test');
    URL.revokeObjectURL = jest.fn();
  });

  afterEach(() => {
    environment.productionMode = originalProductionMode;
    environment.complianceHideClientData = originalPrivacy;
    configurations = null;
    jest.restoreAllMocks();
    jest.useRealTimers();
    TestBed.resetTestingModule();
  });

  it('uses the entity report for a valid ID without a code', () => {
    const component = setup(false, LegalFormId.ENTITY);
    routeData.next({ clientViewData: { ...baseClient, legalForm: { id: '2' } } });
    component.exportKYC();
    expect(TestBed.inject(ReportsService).getPentahoRunReportData).toHaveBeenCalledWith(
      'KYCLegalPerson',
      { 'output-type': 'PDF', R_clientId: '1' },
      'default',
      'en',
      'dd MMMM yyyy'
    );
  });

  it('rejects HTML responses instead of opening a PDF preview', () => {
    const component = setup(false);
    jest.spyOn(TestBed.inject(ReportsService), 'getPentahoRunReportData').mockReturnValue(
      of(
        new HttpResponse({
          body: new Uint8Array([
            60,
            104,
            116,
            109,
            108,
            62
          ]).buffer,
          headers: new HttpHeaders({ 'Content-Type': 'text/html' })
        })
      )
    );
    component.exportKYC();
    expect(component.showPdf).toBe(false);
    expect(URL.createObjectURL).not.toHaveBeenCalled();
  });

  it('renders the legacy Personal Data view when productionMode is false', () => {
    const component = setup(false, LegalFormId.PERSON);

    expect(component.productionMode).toBe(false);
    expect(fixture.debugElement.query(By.css('mifosx-person-production-personal-data'))).toBeNull();
    expect(fixture.debugElement.query(By.css('mifosx-entity-production-personal-data'))).toBeNull();
    expect(personalDataViewService.load).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('labels.heading.Personal Information');
  });

  it('renders the PERSON production view when productionMode is true and legal form is PERSON', () => {
    const component = setup(true, LegalFormId.PERSON.toString());

    expect(component.productionMode).toBe(true);
    expect(component.isPerson()).toBe(true);
    expect(fixture.debugElement.query(By.css('mifosx-person-production-personal-data'))).not.toBeNull();
    expect(fixture.debugElement.query(By.css('mifosx-entity-production-personal-data'))).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('labels.heading.General Client Information');
    expect(fixture.nativeElement.textContent).not.toContain('labels.heading.Account Information');
    expect(personalDataViewService.load).toHaveBeenCalledWith(
      '1',
      [{ registeredTableName: 'client_socioeconomic_information' }],
      false
    );
  });

  it('renders the ENTITY production view when productionMode is true and legal form is ENTITY', () => {
    const component = setup(true, LegalFormId.ENTITY.toString());

    expect(component.productionMode).toBe(true);
    expect(component.isLegalEntity()).toBe(true);
    expect(fixture.debugElement.query(By.css('mifosx-person-production-personal-data'))).toBeNull();
    expect(fixture.debugElement.query(By.css('mifosx-entity-production-personal-data'))).not.toBeNull();
    expect(personalDataViewService.load).toHaveBeenCalledWith(
      '1',
      [{ registeredTableName: 'client_socioeconomic_information' }],
      true
    );
  });

  it('gives ENTITY legal form precedence over ambiguous person text', () => {
    const component = setup(true, LegalFormId.ENTITY, 'Entity Person');

    expect(component.isLegalEntity()).toBe(true);
    expect(component.isPerson()).toBe(false);
    expect(fixture.debugElement.query(By.css('mifosx-person-production-personal-data'))).toBeNull();
    expect(fixture.debugElement.query(By.css('mifosx-entity-production-personal-data'))).not.toBeNull();
  });
  const pdfResponse = (text = '%PDF-1.7 synthetic report', type = 'application/pdf') =>
    new HttpResponse({
      body: Uint8Array.from(text, (character) => character.charCodeAt(0)).buffer,
      headers: new HttpHeaders({ 'Content-Type': type })
    });

  it.each([
    [
      { id: 1 },
      'KYCNaturalPerson'
    ],
    [
      { id: '1' },
      'KYCNaturalPerson'
    ],
    [
      { id: 2 },
      'KYCLegalPerson'
    ],
    [
      { id: '2' },
      'KYCLegalPerson'
    ],
    [
      { code: 'legalFormType.person' },
      'KYCNaturalPerson'
    ],
    [
      { code: 'legalFormType.entity' },
      'KYCLegalPerson'
    ],
    [
      { value: 'Person' },
      'KYCNaturalPerson'
    ],
    [
      { name: 'Legal entity' },
      'KYCLegalPerson'
    ],
    [
      { value: 'Legal person' },
      'KYCLegalPerson'
    ]
  ])('resolves %j to %s without a generic fallback', (legalForm, reportName) => {
    const component = setup(false);
    routeData.next({ clientViewData: { ...baseClient, legalForm } });
    component.exportKYC();
    expect(TestBed.inject(ReportsService).getPentahoRunReportData).toHaveBeenCalledWith(
      reportName,
      { 'output-type': 'PDF', R_clientId: '1' },
      'default',
      'en',
      'dd MMMM yyyy'
    );
    expect(component.showPdf).toBe(true);
    expect(component.isExportingKyc).toBe(false);
  });

  it.each([
    {},
    { id: 99 },
    { code: 'unsupported' },
    { value: 'not a person' },
    { id: 1, code: 'legalFormType.entity' }
  ])('rejects unsupported or contradictory legal forms %j', (legalForm) => {
    const component = setup(false);
    routeData.next({ clientViewData: { ...baseClient, legalForm } });
    component.exportKYC();
    expect(TestBed.inject(ReportsService).getPentahoRunReportData).not.toHaveBeenCalled();
    expect(TestBed.inject(AlertService).alert).toHaveBeenCalled();
  });

  it.each([
    undefined,
    null,
    0,
    -1,
    NaN
  ])('does not request reports for invalid client ID %s', (id) => {
    const component = setup(false);
    routeData.next({ clientViewData: { ...baseClient, id } });
    component.exportKYC();
    expect(TestBed.inject(ReportsService).getPentahoRunReportData).not.toHaveBeenCalled();
  });

  it.each([
    [
      '',
      'application/pdf'
    ],
    [
      '<html>error</html>',
      'text/html'
    ],
    [
      '{"error":"failed"}',
      'application/json'
    ],
    [
      'not PDF bytes',
      'application/pdf'
    ],
    [
      '%PDF-1.7 synthetic',
      'application/octet-stream'
    ],
    [
      '%PDF-1.7 synthetic',
      ''
    ]
  ])('rejects invalid PDF content (%s, %s)', (body, type) => {
    const component = setup(false);
    jest.spyOn(TestBed.inject(ReportsService), 'getPentahoRunReportData').mockReturnValue(of(pdfResponse(body, type)));
    component.exportKYC();
    expect(component.showPdf).toBe(false);
    expect(component.isExportingKyc).toBe(false);
    expect(URL.createObjectURL).not.toHaveBeenCalled();
    expect(TestBed.inject(AlertService).alert).toHaveBeenCalledWith({
      type: 'error',
      message: 'errors.kycReportLoadError'
    });
  });

  it('accepts a parameterized PDF MIME type and builds a PDF Blob', () => {
    const component = setup(false);
    jest
      .spyOn(TestBed.inject(ReportsService), 'getPentahoRunReportData')
      .mockReturnValue(of(pdfResponse(undefined, 'Application/PDF; charset=binary')));
    component.exportKYC();
    expect(URL.createObjectURL).toHaveBeenCalledWith(expect.objectContaining({ type: 'application/pdf', size: 25 }));
    expect(component.pdfUrl).not.toBeNull();
  });

  it.each([
    401,
    403,
    404,
    500,
    503,
    0
  ])('handles HTTP/network error %s without retries or a preview', (status) => {
    const component = setup(false);
    const service = TestBed.inject(ReportsService);
    jest.spyOn(service, 'getPentahoRunReportData').mockReturnValue(throwError(() => ({ status })));
    component.exportKYC();
    expect(service.getPentahoRunReportData).toHaveBeenCalledTimes(1);
    expect(component.showPdf).toBe(false);
    expect(component.isExportingKyc).toBe(false);
    expect(TestBed.inject(AlertService).alert).toHaveBeenCalled();
  });

  it('prevents double exports and restores button state after a timeout', () => {
    jest.useFakeTimers();
    const component = setup(false);
    const pending = new Subject<any>();
    jest.spyOn(TestBed.inject(ReportsService), 'getPentahoRunReportData').mockReturnValue(pending);
    component.exportKYC();
    component.exportKYC();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.export-kyc-button').disabled).toBe(true);
    expect(TestBed.inject(ReportsService).getPentahoRunReportData).toHaveBeenCalledTimes(1);
    jest.advanceTimersByTime(120001);
    expect(component.isExportingKyc).toBe(false);
    expect(pending.observed).toBe(false);
    expect(component.showPdf).toBe(false);
  });

  it('cancels Client A export on client change and only displays Client B report', () => {
    const component = setup(false);
    const pending = new Subject<any>();
    const service = TestBed.inject(ReportsService);
    jest.spyOn(service, 'getPentahoRunReportData').mockReturnValueOnce(pending).mockReturnValueOnce(of(pdfResponse()));
    component.exportKYC();
    routeData.next({ clientViewData: { ...baseClient, id: 2 } });
    expect(pending.observed).toBe(false);
    pending.next(pdfResponse());
    expect(component.showPdf).toBe(false);
    expect(component.isExportingKyc).toBe(false);
    component.exportKYC();
    expect(service.getPentahoRunReportData).toHaveBeenLastCalledWith(
      'KYCNaturalPerson',
      { 'output-type': 'PDF', R_clientId: '2' },
      'default',
      'en',
      'dd MMMM yyyy'
    );
    expect(component.showPdf).toBe(true);
  });

  it('discards a response when the selected tenant changes', () => {
    const component = setup(false);
    const pending = new Subject<any>();
    jest.spyOn(TestBed.inject(ReportsService), 'getPentahoRunReportData').mockReturnValue(pending);
    component.exportKYC();
    (TestBed.inject(SettingsService) as any).tenantIdentifier = 'another-tenant';
    pending.next(pdfResponse());
    pending.complete();
    expect(component.showPdf).toBe(false);
    expect(URL.createObjectURL).not.toHaveBeenCalled();
  });

  it('downloads only the current validated PDF with a client-ID filename', () => {
    const component = setup(false);
    const download = jest.spyOn(downloads, 'downloadBlob').mockImplementation(() => {});
    component.downloadKyc();
    expect(download).not.toHaveBeenCalled();
    component.exportKYC();
    component.downloadKyc();
    expect(download).toHaveBeenCalledWith(expect.objectContaining({ type: 'application/pdf' }), 'KYC-1.pdf');
    routeData.next({ clientViewData: { ...baseClient, id: 2 } });
    component.downloadKyc();
    expect(download).toHaveBeenCalledTimes(1);
    expect(component.pdfUrl).toBeNull();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:kyc-test');
  });

  it('releases the old URL before repeat export and on close and destruction', () => {
    const component = setup(false);
    component.exportKYC();
    component.exportKYC();
    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(1);
    component.onModalKeydown(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(component.showPdf).toBe(false);
    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(2);
    component.exportKYC();
    fixture.destroy();
    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(3);
    expect(component.pdfUrl).toBeNull();
  });

  it('cancels a pending request when destroyed', () => {
    const component = setup(false);
    const pending = new Subject<any>();
    jest.spyOn(TestBed.inject(ReportsService), 'getPentahoRunReportData').mockReturnValue(pending);
    component.exportKYC();
    fixture.destroy();
    expect(pending.observed).toBe(false);
    pending.next(pdfResponse());
    expect(URL.createObjectURL).not.toHaveBeenCalled();
  });

  it.each([
    false,
    true
  ])('keeps the flag, privacy and report grants consistent in production=%s', (production) => {
    const component = setup(production);
    const auth = TestBed.inject(AuthenticationService);
    const credentials = jest.spyOn(auth, 'getCredentials');
    for (const permissions of [
      ['READ_CLIENT'],
      ['READ_REPORT'],
      [
        'READ_CLIENT',
        'READ_KYCLegalPerson'
      ],
      []
    ]) {
      credentials.mockReturnValue({ permissions } as any);
      routeData.next(routeData.value);
      expect(component.canExportKyc).toBe(false);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.export-kyc-button')).toBeNull();
      expect(fixture.nativeElement.querySelector('.validate-docs-button')).not.toBeNull();
    }
    credentials.mockReturnValue({ permissions: [
        'READ_CLIENT',
        'READ_KYCNaturalPerson'
      ] } as any);
    routeData.next(routeData.value);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.export-kyc-button')).not.toBeNull();
    environment.complianceHideClientData = true;
    component.exportKYC();
    expect(TestBed.inject(ReportsService).getPentahoRunReportData).not.toHaveBeenCalled();
    component.isKycEnabled = false;
    routeData.next(routeData.value);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.button-header')).toBeNull();
  });

  it.each([
    false,
    true
  ])('fails closed during config loading and failure=%s', (failure) => {
    configurations = new Subject<any>();
    const component = setup(false);
    expect(component.canExportKyc).toBe(false);
    expect(fixture.nativeElement.querySelector('.button-header')).toBeNull();
    if (failure) {
      configurations.error(new Error('unavailable'));
    } else {
      configurations.next({ globalConfiguration: [{ name: 'enable-kyc-validation', enabled: false }] });
    }
    fixture.detectChanges();
    expect(component.canExportKyc).toBe(false);
    expect(fixture.nativeElement.querySelector('.button-header')).toBeNull();
  });
  it.each([
    ['ALL_FUNCTIONS'],
    ['ALL_FUNCTIONS_READ'],
    [
      'READ_CLIENT',
      'REPORTING_SUPER_USER'
    ],
    [
      'READ_CLIENT',
      'READ_KYCNaturalPerson'
    ]
  ])('accepts existing client/report grants %j', (...permissions: string[]) => {
    const component = setup(false);
    jest.spyOn(TestBed.inject(AuthenticationService), 'getCredentials').mockReturnValue({ permissions } as any);
    expect(component.canExportKyc).toBe(true);
  });

  it('blocks a direct unauthorized invocation and never calls the report service', () => {
    const component = setup(false);
    jest
      .spyOn(TestBed.inject(AuthenticationService), 'getCredentials')
      .mockReturnValue({ permissions: ['READ_CLIENT'] } as any);
    component.exportKYC();
    expect(TestBed.inject(ReportsService).getPentahoRunReportData).not.toHaveBeenCalled();
  });

  it('hides an existing preview and prevents downloading after a tenant change', () => {
    const component = setup(false);
    const download = jest.spyOn(downloads, 'downloadBlob').mockImplementation(() => {});
    component.exportKYC();
    expect(component.hasCurrentKycPreview).toBe(true);
    (TestBed.inject(SettingsService) as any).tenantIdentifier = 'another-tenant';
    expect(component.hasCurrentKycPreview).toBe(false);
    component.downloadKyc();
    expect(download).not.toHaveBeenCalled();
  });
});
