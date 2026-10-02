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

  it('renders all six backend stages and their completed, current, and pending statuses', async () => {
    await setup();

    const text = fixture.nativeElement.textContent;
    expect(fixture.nativeElement.querySelectorAll('.stage')).toHaveLength(6);
    expect(text).toContain('COMPLETED');
    expect(text).toContain('CURRENT');
    expect(text).toContain('PENDING');
  });

  it('renders a completion timestamp and does not fabricate a null timestamp', async () => {
    await setup();

    const stageText = Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('.stage')).map(
      (stage) => stage.textContent
    );
    expect(stageText[0]).toContain('2026-09-01T10:30:00Z');
    expect(stageText[1]).toContain('acquisition.notAvailable');
  });

  it('preserves an unknown backend status instead of mapping it to pending', async () => {
    const unknownStatusBoard: AcquisitionBoard = {
      ...board,
      stages: [{ ...board.stages[0], status: 'MANUAL_REVIEW' }]
    };
    await setup(of(unknownStatusBoard));

    expect(fixture.nativeElement.textContent).toContain('MANUAL_REVIEW');
    expect(fixture.nativeElement.textContent).not.toContain('PENDING');
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
