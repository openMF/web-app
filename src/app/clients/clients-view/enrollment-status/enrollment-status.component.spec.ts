/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { DatePipe } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNativeDateAdapter } from '@angular/material/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject, of, throwError } from 'rxjs';
import azAz from 'assets/translations/az-AZ.json';
import enUs from 'assets/translations/en-US.json';

import { EnrollmentCase, TasksService } from 'app/tasks/tasks.service';
import { EnrollmentStatusComponent } from './enrollment-status.component';

describe('EnrollmentStatusComponent', () => {
  let component: EnrollmentStatusComponent;
  let fixture: ComponentFixture<EnrollmentStatusComponent>;
  let tasksService: { getEnrollmentCases: jest.Mock };
  let clientParams: BehaviorSubject<ReturnType<typeof convertToParamMap>>;

  const enrollmentCase: EnrollmentCase = {
    clientId: 42,
    clientLifecycleStatus: 'IN_PROGRESS',
    enrollmentStages: [
      { name: 'COMMERCIAL_REGISTRATION', status: 'COMPLETED', aging: { days: 2 } },
      { name: 'KYC_LEVEL_1', status: 'COMPLETED' },
      { name: 'KYC_LEVEL_2', status: 'CURRENT', aging: { days: 8 } },
      { name: 'KYC_LEVEL_3', status: 'PENDING' },
      { name: 'COMPLIANCE_DOCUMENT_VALIDATION', status: 'BLOCKED', aging: { days: 11 } },
      { name: 'COMMERCIAL_ACTIVATION', status: 'NOT_STARTED' },
      { name: 'OPERATIONS_ACTIVATION', status: 'NOT_STARTED' }
    ],
    kycEvidence: { derivedKycStatus: 'REVIEW_REQUIRED' }
  };

  function createComponent(response = of({ totalFilteredRecords: 1, pageItems: [enrollmentCase] })): void {
    clientParams = new BehaviorSubject(convertToParamMap({ clientId: '42' }));
    tasksService = { getEnrollmentCases: jest.fn(() => response) };

    TestBed.configureTestingModule({
      imports: [
        EnrollmentStatusComponent,
        TranslateModule.forRoot(),
        NoopAnimationsModule
      ],
      providers: [
        DatePipe,
        provideNativeDateAdapter(),
        { provide: TasksService, useValue: tasksService },
        { provide: ActivatedRoute, useValue: { parent: { paramMap: clientParams.asObservable() } } }
      ]
    });

    fixture = TestBed.createComponent(EnrollmentStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  afterEach(() => TestBed.resetTestingModule());

  it('loads the enrollment case for the current profile client', () => {
    createComponent();

    expect(tasksService.getEnrollmentCases).toHaveBeenCalledWith({
      view: 'enrollment',
      clientId: '42',
      offset: 0,
      limit: 1
    });
    expect(component.enrollmentCase).toEqual(enrollmentCase);
  });

  it('reloads with the new client id when the profile changes', () => {
    createComponent();
    tasksService.getEnrollmentCases.mockReturnValue(
      of({ totalFilteredRecords: 1, pageItems: [{ ...enrollmentCase, clientId: 84 }] })
    );

    clientParams.next(convertToParamMap({ clientId: '84' }));
    fixture.detectChanges();

    expect(tasksService.getEnrollmentCases).toHaveBeenLastCalledWith({
      view: 'enrollment',
      clientId: '84',
      offset: 0,
      limit: 1
    });
    expect(component.enrollmentCase?.clientId).toBe(84);
  });

  it('renders exactly four primary enrollment nodes in business order', () => {
    createComponent();

    const nodes = [...fixture.nativeElement.querySelectorAll('.stage-node')];
    expect(nodes).toHaveLength(4);
    expect(nodes.map((node: Element) => node.getAttribute('data-stage'))).toEqual([
      'registration',
      'kyc',
      'compliance',
      'activation'
    ]);
  });

  it('shows the determined KYC level inside the single Biometrics and KYC node', () => {
    createComponent();

    const kycNode = fixture.nativeElement.querySelector('[data-stage="kyc"]');
    expect(kycNode.textContent).toContain('enrollmentStatus.stages.kyc');
    expect(fixture.nativeElement.textContent).toContain('enrollmentStatus.stages.kycLevel2');
    expect(fixture.nativeElement.querySelectorAll('[data-stage="kyc"]')).toHaveLength(1);
  });

  it('renders completed stages with a green check and no historical aging warning', () => {
    createComponent();

    const registrationNode = fixture.nativeElement.querySelector('[data-stage="registration"]');
    expect(registrationNode.classList).toContain('stage-completed');
    expect(registrationNode.querySelector('.stage-marker').textContent).toContain('check');
    expect(registrationNode.textContent).not.toContain('enrollmentStatus.fields.days');
  });

  it.each([
    'WITHDRAWN',
    'CLOSED'
  ])('renders the terminal %s status with blocked styling', (status) => {
    createComponent();
    const group = {
      id: 'activation' as const,
      label: 'enrollmentStatus.stages.activation',
      stages: [
        { name: 'COMMERCIAL_ACTIVATION', status: 'COMPLETED' },
        { name: 'OPERATIONS_ACTIVATION', status, aging: { days: 12 } }
      ]
    };

    expect(component.groupStatus(group)).toBe(status);
    expect(component.groupVisualClass(group)).toBe('stage-blocked');
    expect(component.groupIcon(group)).toBe('priority_high');
    expect(component.groupAging(group)).toBeNull();
  });

  it.each([
    [
      1,
      'stage-yellow',
      'enrollmentStatus.statuses.IN_PROGRESS'
    ],
    [
      5,
      'stage-yellow',
      'enrollmentStatus.statuses.IN_PROGRESS'
    ],
    [
      6,
      'stage-orange',
      'enrollmentStatus.traffic.needsAttention'
    ],
    [
      10,
      'stage-orange',
      'enrollmentStatus.traffic.needsAttention'
    ],
    [
      11,
      'stage-red',
      'enrollmentStatus.traffic.overdue'
    ]
  ])('maps %i elapsed days to the traffic-light class and readable status', (days, cssClass, label) => {
    createComponent();
    const group = {
      id: 'compliance' as const,
      label: 'enrollmentStatus.stages.compliance',
      stages: [{ name: 'COMPLIANCE', status: 'IN_PROGRESS', aging: { days } }]
    };

    expect(component.groupVisualClass(group)).toBe(cssClass);
    expect(component.groupStatusLabel(group)).toBe(label);
  });

  it('preserves a backend-provided traffic-light value', () => {
    createComponent();
    const group = {
      id: 'compliance' as const,
      label: 'enrollmentStatus.stages.compliance',
      stages: [{ name: 'COMPLIANCE', status: 'IN_PROGRESS', aging: { days: 2, trafficLight: 'Red' } }]
    };

    expect(component.groupVisualClass(group)).toBe('stage-red');
    expect(component.groupStatusLabel(group)).toBe('enrollmentStatus.traffic.overdue');
  });

  it('does not expose mapping diagnostics, raw source fields, or repeated unknown values', () => {
    const technicalCase: EnrollmentCase = {
      clientId: 42,
      enrollmentStages: [
        {
          name: 'COMMERCIAL_REGISTRATION',
          status: 'UNKNOWN',
          source: 'm_client.submittedon_date'
        },
        {
          name: 'KYC_LEVEL_1',
          status: 'UNKNOWN',
          source: 'MISSING_EXPLICIT_KYC_LEVEL_MAPPING'
        },
        {
          name: 'COMPLIANCE',
          status: 'UNKNOWN',
          source: 'MISSING_EXPLICIT_COMPLIANCE_DECISION'
        },
        {
          name: 'ACTIVATION',
          status: 'COMPLETED',
          source: 'm_client.status_enum,m_client.activation_date'
        }
      ],
      kycEvidence: {
        faceMatchEvidenceStatus: 'UNKNOWN',
        idVerificationEvidenceStatus: 'UNKNOWN',
        amlScreeningEvidenceStatus: 'UNKNOWN'
      }
    };
    createComponent(of({ totalFilteredRecords: 1, pageItems: [technicalCase] }));

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('enrollmentStatus.notAvailable');
    expect(text).not.toContain('MISSING_EXPLICIT');
    expect(text).not.toContain('m_client');
    expect(text).not.toContain('UNKNOWN');
    expect(text).not.toContain('labels.inputs.Source');
  });

  it('uses one responsive progress list without horizontal table content', () => {
    createComponent();

    expect(fixture.nativeElement.querySelector('.progress-track[role="list"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelectorAll('[role="listitem"]')).toHaveLength(4);
    expect(fixture.nativeElement.querySelector('table')).toBeNull();
  });

  it('has the connected-dashboard translation keys in the English locale', () => {
    expect(enUs.enrollmentStatus.stages.documentValidation).toBeTruthy();
    expect(enUs.enrollmentStatus.traffic.needsAttention).toBeTruthy();
    expect(enUs.enrollmentStatus.traffic.overdue).toBeTruthy();
    expect(enUs.enrollmentStatus.fields.days).toContain('{{count}}');
  });

  it('uses the Azerbaijani translation for the active status', () => {
    expect(azAz.enrollmentStatus.statuses.ACTIVE).toBe('Aktiv');
  });

  it('shows an empty state when the client has no enrollment information', () => {
    createComponent(of({ totalFilteredRecords: 0, pageItems: [] }));

    expect(component.enrollmentCase).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('enrollmentStatus.empty');
  });

  it('shows permission and generic API errors without exposing backend details', () => {
    createComponent(throwError(() => ({ status: 403, message: 'sensitive backend message' })));

    expect(component.loadError).toBe('enrollmentStatus.errors.forbidden');
    expect(fixture.nativeElement.textContent).not.toContain('sensitive backend message');
  });
});
