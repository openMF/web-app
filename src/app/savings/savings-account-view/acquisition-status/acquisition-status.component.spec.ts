/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Observable, Subject, of, throwError } from 'rxjs';
import { describe, expect, it, jest } from '@jest/globals';

import { AcquisitionBoard } from '../../models/acquisition-board.model';
import { SavingsService } from '../../savings.service';
import { AcquisitionStatusComponent } from './acquisition-status.component';

describe('AcquisitionStatusComponent', () => {
  let fixture: ComponentFixture<AcquisitionStatusComponent>;
  let getAcquisitionBoard: jest.Mock;

  const board: AcquisitionBoard = {
    clientId: 90,
    accountId: 87,
    prospectId: 12,
    currentStage: 'COMPLIANCE',
    stages: [
      {
        code: 'ONBOARDING',
        name: 'Commercial registration / Onboarding',
        status: 'COMPLETED',
        completedOn: '2026-09-01T10:30:00Z',
        details: {
          source: 'm_prospect_stage_event:API',
          sourceStatus: 'COMPLETED',
          actorId: 4,
          actorName: 'mifos',
          sourceReference: '12',
          reason: null,
          transactionId: null,
          amount: null,
          currencyCode: null,
          accountStatus: null
        }
      },
      {
        code: 'COMPLIANCE',
        name: 'File / Compliance',
        status: 'CURRENT',
        completedOn: null,
        details: null
      },
      {
        code: 'APPROVAL',
        name: 'Committee / Internal Control validation',
        status: 'PENDING',
        completedOn: null,
        details: null
      },
      {
        code: 'ACTIVATION',
        name: 'Commercial / Operations activation',
        status: 'PENDING',
        completedOn: null,
        details: null
      },
      {
        code: 'DEPOSIT',
        name: 'ATM / Account deposit',
        status: 'PENDING',
        completedOn: null,
        details: null
      },
      {
        code: 'WITHDRAWAL',
        name: 'ATM / Account withdrawal',
        status: 'PENDING',
        completedOn: null,
        details: null
      }
    ]
  };

  async function setup(
    response: Observable<AcquisitionBoard> = of(board),
    savingsAccountData: { id?: number; clientId?: number } = { id: 87, clientId: 90 }
  ): Promise<void> {
    getAcquisitionBoard = jest.fn(() => response);
    await TestBed.configureTestingModule({
      imports: [
        AcquisitionStatusComponent,
        NoopAnimationsModule,
        TranslateModule.forRoot()
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            parent: {
              snapshot: {
                data: { savingsAccountData }
              }
            }
          }
        },
        { provide: SavingsService, useValue: { getAcquisitionBoard } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AcquisitionStatusComponent);
    fixture.detectChanges();
  }

  afterEach(() => TestBed.resetTestingModule());

  it('uses the client and account identifiers supplied by the savings account route', async () => {
    await setup();

    expect(getAcquisitionBoard).toHaveBeenCalledWith(90, 87);
  });

  it('shows a terminal unavailable state without requesting or retrying when the client identifier is absent', async () => {
    await setup(of(board), { id: 87 });

    expect(getAcquisitionBoard).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('acquisition.empty');
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
  });

  it('shows loading until the backend responds', async () => {
    const response = new Subject<AcquisitionBoard>();
    await setup(response);

    expect(fixture.nativeElement.querySelector('mat-spinner')).not.toBeNull();
    response.next(board);
    response.complete();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('mat-spinner')).toBeNull();
  });

  it('renders all six stages in the required business order regardless of backend array order', async () => {
    await setup(of({ ...board, stages: [...board.stages].reverse() }));

    const headings = Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('.stage h3')).map((heading) =>
      heading.textContent?.trim()
    );
    expect(headings).toEqual([
      'acquisition.stages.ONBOARDING',
      'acquisition.stages.COMPLIANCE',
      'acquisition.stages.APPROVAL',
      'acquisition.stages.ACTIVATION',
      'acquisition.stages.DEPOSIT',
      'acquisition.stages.WITHDRAWAL'
    ]);
  });

  it('maps completed, current, and pending backend statuses to semantic colors, icons, and translated text', async () => {
    await setup();

    const stages = fixture.nativeElement.querySelectorAll('.stage');
    expect(stages).toHaveLength(6);
    expect(stages[0].querySelector('.stage-marker').classList.contains('status-completed')).toBe(true);
    expect(stages[0].querySelector('.stage-marker mat-icon').textContent).toContain('check');
    expect(stages[0].querySelector('mat-chip').textContent).toContain('acquisition.statuses.COMPLETED');
    expect(stages[0].querySelector('.stage-marker').getAttribute('aria-label')).toBe('acquisition.statuses.COMPLETED');
    expect(stages[1].querySelector('.stage-marker').classList.contains('status-current')).toBe(true);
    expect(stages[1].classList.contains('current-stage')).toBe(true);
    expect(stages[1].getAttribute('aria-labelledby')).toBe('acquisition-stage-COMPLIANCE');
    expect(stages[1].querySelector('.stage-marker mat-icon').textContent).toContain('autorenew');
    expect(stages[1].querySelector('mat-chip').textContent).toContain('acquisition.statuses.CURRENT');
    expect(stages[2].querySelector('.stage-marker').classList.contains('status-pending')).toBe(true);
    expect(stages[2].querySelector('.stage-marker mat-icon').textContent).toContain('schedule');
    expect(stages[2].querySelector('mat-chip').textContent).toContain('acquisition.statuses.PENDING');
    expect(stages[0].querySelector('.connector').classList.contains('connector-completed')).toBe(true);
    expect(stages[1].querySelector('.connector').classList.contains('connector-completed')).toBe(false);
  });

  it('uses currentStage as the single source of current-stage emphasis when it is present', async () => {
    await setup(of({ ...board, currentStage: 'APPROVAL' }));

    const stages = fixture.nativeElement.querySelectorAll('.stage');
    expect(stages[1].classList.contains('current-stage')).toBe(false);
    expect(stages[1].querySelector('.current-indicator')).toBeNull();
    expect(stages[2].classList.contains('current-stage')).toBe(true);
    expect(stages[2].querySelector('.current-indicator')).not.toBeNull();
    expect(fixture.nativeElement.querySelectorAll('.current-indicator')).toHaveLength(1);
  });

  it('maps blocked and failed backend statuses to the error state without inferring status from position', async () => {
    const exceptionalBoard: AcquisitionBoard = {
      ...board,
      currentStage: 'ONBOARDING',
      stages: board.stages.map((stage) => ({
        ...stage,
        status: stage.code === 'ONBOARDING' ? 'PENDING' : stage.code === 'APPROVAL' ? 'BLOCKED' : 'FAILED'
      }))
    };
    await setup(of(exceptionalBoard));

    const stages = fixture.nativeElement.querySelectorAll('.stage');
    expect(stages[0].querySelector('.stage-marker').classList.contains('status-pending')).toBe(true);
    expect(stages[2].querySelector('.stage-marker').classList.contains('status-error')).toBe(true);
    expect(stages[2].querySelector('.stage-marker mat-icon').textContent).toContain('block');
    expect(stages[2].querySelector('mat-chip').textContent).toContain('acquisition.statuses.BLOCKED');
    expect(stages[3].querySelector('.stage-marker').classList.contains('status-error')).toBe(true);
    expect(stages[3].querySelector('.stage-marker mat-icon').textContent).toContain('error');
    expect(stages[3].querySelector('mat-chip').textContent).toContain('acquisition.statuses.FAILED');
  });

  it('renders a completion timestamp and does not fabricate a null timestamp', async () => {
    await setup();

    const stageText = Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('.stage')).map(
      (stage) => stage.textContent
    );
    expect(stageText[0]).toContain('2026-09-01T10:30:00Z');
    expect(stageText[1]).toContain('acquisition.notAvailable');
  });

  it('uses an accessible translated fallback instead of leaking an unknown backend enum', async () => {
    const unknownStatusBoard: AcquisitionBoard = {
      ...board,
      stages: [{ ...board.stages[0], status: 'MANUAL_REVIEW' }]
    };
    await setup(of(unknownStatusBoard));

    const marker = fixture.nativeElement.querySelector('.stage-marker');
    expect(marker.classList.contains('status-unknown')).toBe(true);
    expect(marker.textContent).toContain('help_outline');
    expect(marker.getAttribute('aria-label')).toBe('acquisition.statuses.UNKNOWN');
    expect(fixture.nativeElement.textContent).toContain('acquisition.statuses.UNKNOWN');
    expect(fixture.nativeElement.textContent).not.toContain('MANUAL_REVIEW');
  });

  it('does not expose backend stage names or technical source and account statuses', async () => {
    const technicalBoard: AcquisitionBoard = {
      ...board,
      stages: [
        {
          ...board.stages[0],
          name: 'INTERNAL_STAGE_NAME',
          details: {
            ...board.stages[0].details,
            sourceStatus: 'INTERNAL_SOURCE_STATUS',
            accountStatus: 'TECHNICAL_ACCOUNT_STATUS'
          }
        },
        ...board.stages.slice(1)
      ]
    };
    await setup(of(technicalBoard));

    expect(fixture.nativeElement.textContent).not.toContain('INTERNAL_STAGE_NAME');
    expect(fixture.nativeElement.textContent).not.toContain('INTERNAL_SOURCE_STATUS');
    expect(fixture.nativeElement.textContent).not.toContain('TECHNICAL_ACCOUNT_STATUS');
  });

  it('shows the empty state when the backend returns no stages', async () => {
    await setup(of({ ...board, stages: [] }));

    expect(fixture.nativeElement.textContent).toContain('acquisition.empty');
  });

  it.each([
    [
      403,
      'acquisition.errors.forbidden'
    ],
    [
      404,
      'acquisition.errors.notFound'
    ],
    [
      500,
      'acquisition.errors.generic'
    ]
  ])('shows the specific error state for HTTP %s', async (status, message) => {
    await setup(throwError(() => new HttpErrorResponse({ status })));

    expect(fixture.nativeElement.textContent).toContain(message);
    expect(fixture.nativeElement.querySelectorAll('.stage')).toHaveLength(0);
  });
});
