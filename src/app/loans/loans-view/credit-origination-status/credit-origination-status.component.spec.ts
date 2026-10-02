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
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Observable, Subject, of, throwError } from 'rxjs';
import { describe, expect, it, jest } from '@jest/globals';

import {
  CreditOriginationBoard,
  CreditOriginationStageCode,
  CreditOriginationStageStatus
} from '../../models/credit-origination-board.model';
import { LoansService } from '../../loans.service';
import { CreditOriginationStatusComponent } from './credit-origination-status.component';

describe('CreditOriginationStatusComponent', () => {
  let fixture: ComponentFixture<CreditOriginationStatusComponent>;
  let getCreditOriginationBoard: jest.Mock;

  const codes: CreditOriginationStageCode[] = [
    'ONBOARDING',
    'COMPLIANCE',
    'PARAMETRIC_SCORE',
    'FILE_INTEGRATION',
    'CREDIT_ANALYSIS',
    'APPROVAL',
    'LEGAL_INSTRUMENTATION',
    'DISBURSEMENT',
    'RECOVERY'
  ];

  const board: CreditOriginationBoard = {
    creditApplicationId: 87,
    clientId: 90,
    loanId: 87,
    prospectId: 12,
    currentStage: 'COMPLIANCE',
    stages: codes.map((code, index) => ({
      code,
      displayName: code,
      status: index === 0 ? 'COMPLETED' : index === 1 ? 'CURRENT' : 'PENDING',
      completedOn: index === 0 ? '2026-09-01T10:30:00Z' : null,
      details:
        index === 0
          ? {
              source: 'WORKFLOW',
              sourceStatus: 'COMPLETED',
              actorId: 4,
              actorName: 'mifos',
              sourceReference: 'event-12',
              reason: 'Verified',
              transactionId: 44,
              amount: 125,
              currencyCode: 'USD',
              loanStatus: 'APPROVED'
            }
          : null
    }))
  };

  async function setup(
    response: Observable<CreditOriginationBoard> = of(board),
    loanId: string | null = '87'
  ): Promise<void> {
    getCreditOriginationBoard = jest.fn(() => response);
    await TestBed.configureTestingModule({
      imports: [
        CreditOriginationStatusComponent,
        NoopAnimationsModule,
        TranslateModule.forRoot()
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            parent: {
              snapshot: { paramMap: convertToParamMap(loanId ? { loanId } : {}) }
            }
          }
        },
        { provide: LoansService, useValue: { getCreditOriginationBoard } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CreditOriginationStatusComponent);
    fixture.detectChanges();
  }

  afterEach(() => TestBed.resetTestingModule());

  it('uses the credit application identifier from the real parent loan route', async () => {
    await setup();

    expect(getCreditOriginationBoard).toHaveBeenCalledWith('87');
  });

  it('does not request the backend or offer retry when the route identifier is absent', async () => {
    await setup(of(board), null);

    expect(getCreditOriginationBoard).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('creditOrigination.empty');
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
  });

  it('shows loading without placeholder stages until the backend responds', async () => {
    const response = new Subject<CreditOriginationBoard>();
    await setup(response);

    expect(fixture.nativeElement.querySelector('mat-spinner')).not.toBeNull();
    expect(fixture.nativeElement.querySelectorAll('.stage')).toHaveLength(0);

    response.next(board);
    response.complete();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('mat-spinner')).toBeNull();
  });

  it('renders all nine phases in the exact order returned by the backend', async () => {
    const nonlinearBoard: CreditOriginationBoard = {
      ...board,
      stages: board.stages.map((stage, index) => ({
        ...stage,
        status: index === 4 ? 'COMPLETED' : stage.status
      }))
    };
    await setup(of(nonlinearBoard));

    const stages = Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('.stage'));
    expect(stages).toHaveLength(9);
    expect(stages.map((stage) => stage.querySelector('h3')?.textContent?.trim())).toEqual(
      codes.map((code) => `creditOrigination.stages.${code}`)
    );
    expect(stages[4].textContent).toContain('creditOrigination.statuses.COMPLETED');
  });

  it.each<CreditOriginationStageStatus>([
    'COMPLETED',
    'CURRENT',
    'PENDING',
    'REJECTED',
    'BLOCKED',
    'FAILED',
    'CANCELLED',
    'WITHDRAWN',
    'WRITTEN_OFF'
  ])('renders the backend %s state without changing it', async (status) => {
    await setup(
      of({
        ...board,
        stages: [{ ...board.stages[0], status }]
      })
    );

    expect(fixture.nativeElement.textContent).toContain(`creditOrigination.statuses.${status}`);
    expect(fixture.nativeElement.querySelector(`.status-${status.toLowerCase().replace('_', '-')}`)).not.toBeNull();
  });

  it('renders timestamps and evidence only when the backend supplies them', async () => {
    await setup();

    const stages = Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('.stage'));
    expect(stages[0].textContent).toContain('2026');
    expect(stages[0].textContent).toContain('WORKFLOW');
    expect(stages[0].textContent).toContain('mifos');
    expect(stages[0].textContent).toContain('event-12');
    expect(stages[0].textContent).toContain('125 USD');
    expect(stages[0].textContent).toContain('APPROVED');
    expect(stages[0].textContent).toContain('Verified');
    expect(stages[1].textContent).not.toContain('creditOrigination.fields.completedOn');
  });

  it('shows the empty state when the backend returns no stages', async () => {
    await setup(of({ ...board, stages: [] }));

    expect(fixture.nativeElement.textContent).toContain('creditOrigination.empty');
  });

  it.each([
    [
      401,
      'creditOrigination.errors.unauthorized'
    ],
    [
      403,
      'creditOrigination.errors.forbidden'
    ],
    [
      404,
      'creditOrigination.errors.notFound'
    ],
    [
      500,
      'creditOrigination.errors.generic'
    ]
  ])('shows the specific error state for HTTP %s', async (status, message) => {
    await setup(throwError(() => new HttpErrorResponse({ status: status as number })));

    expect(fixture.nativeElement.textContent).toContain(message);
    expect(fixture.nativeElement.querySelectorAll('.stage')).toHaveLength(0);
  });

  it('retries the real request after an API failure', async () => {
    await setup(throwError(() => new HttpErrorResponse({ status: 500 })));
    getCreditOriginationBoard.mockReturnValueOnce(of(board));

    fixture.nativeElement.querySelector('button').click();
    fixture.detectChanges();

    expect(getCreditOriginationBoard).toHaveBeenCalledTimes(2);
    expect(fixture.nativeElement.querySelectorAll('.stage')).toHaveLength(9);
  });
});
