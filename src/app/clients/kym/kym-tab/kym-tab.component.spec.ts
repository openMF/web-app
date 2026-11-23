/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { DatePipe, DecimalPipe } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

import { KymTabComponent } from './kym-tab.component';
import { KymService } from '../kym.service';
import { KymHistoryRow } from '../kym.models';
import { SettingsService } from 'app/settings/settings.service';

describe('KymTabComponent: Changes', () => {
  let fixture: ComponentFixture<KymTabComponent>;
  let component: KymTabComponent;
  let kymService: Record<string, jest.Mock>;
  let history: KymHistoryRow[];

  /** n changes, newest first as the server sends them: change 1 is the latest. */
  const changes = (n: number): KymHistoryRow[] =>
    Array.from({ length: n }, (_, i): KymHistoryRow => ({
      field: 'remarks',
      oldValue: null,
      newValue: `change ${i + 1}`,
      happenedOn: '2026-11-22',
      recordedOn: '2026-11-22',
      inPerson: true,
      lateNotice: false,
      changedBy: 'mifos'
    }));

  const kym: any = {
    clientId: 793,
    level: 'FULL',
    simplifiedReason: null,
    status: 'INCOMPLETE',
    missing: [],
    verifiedOn: null,
    verifiedBy: null,
    nextReviewOn: null,
    reviewDue: false,
    values: {
      maritalStatus: null,
      familyType: null,
      occupationId: 80,
      noPan: false,
      pepSelf: false,
      otherCoops: [],
      familyHere: [],
      incomeSources: [],
      recommenders: [],
      beneficialOwners: []
    }
  };

  /** The section the changes are in. */
  const section = (): HTMLElement =>
    Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('section.frame')).find((s) =>
      s.querySelector('h3')?.textContent?.includes('kym.Changes')
    ) as HTMLElement;
  const shownRows = () => section().querySelectorAll('tbody tr').length;
  const toggle = (): HTMLButtonElement | null => section().querySelector('.history-toggle button');

  function render(rows: KymHistoryRow[]) {
    history = rows;
    kymService = {
      canRead: jest.fn(() => true),
      canUpdate: jest.fn(() => true),
      canVerify: jest.fn(() => false),
      canUploadDocuments: jest.fn(() => false),
      get: jest.fn(() => of(kym)),
      history: jest.fn(() => of(history)),
      professions: jest.fn(() => of([{ id: 80, name: 'Business owner' }]))
    };
    TestBed.configureTestingModule({
      imports: [
        KymTabComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        DatePipe,
        DecimalPipe,
        provideNoopAnimations(),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: { parent: { paramMap: of(convertToParamMap({ clientId: '793' })) } } },
        { provide: KymService, useValue: kymService },
        { provide: MatDialog, useValue: { open: jest.fn() } },
        // What the date and number pipes read, without the browser's stored settings.
        {
          provide: SettingsService,
          useValue: { dateFormat: 'dd MMMM yyyy', language: { name: 'English', code: 'en' }, decimals: 2 }
        }
      ]
    });
    fixture = TestBed.createComponent(KymTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  /** Redraws after a click handled outside the template (the component is OnPush). */
  const redraw = () => {
    fixture.componentRef.changeDetectorRef.markForCheck();
    fixture.detectChanges();
  };

  beforeEach(() => {
    TestBed.resetTestingModule();
  });

  it('shows the latest 5 changes without a click, with Show all (N)', () => {
    render(changes(11));

    expect(kymService.history).toHaveBeenCalledWith(793);
    expect(shownRows()).toBe(5);
    expect(section().querySelector('tbody tr td:nth-child(4)').textContent).toContain('change 1');
    expect(toggle().textContent).toContain('kym.Show all');
  });

  it('expands to every change with Show all, and back to 5 with Show less', () => {
    render(changes(11));

    toggle().click();
    redraw();
    expect(shownRows()).toBe(11);
    expect(toggle().textContent).toContain('kym.Show less');

    const scrollIntoView = jest.fn();
    section().scrollIntoView = scrollIntoView;
    toggle().click();
    redraw();
    expect(shownRows()).toBe(5);
    expect(scrollIntoView).toHaveBeenCalled();
  });

  it('shows no toggle with 5 changes or fewer', () => {
    render(changes(5));

    expect(shownRows()).toBe(5);
    expect(toggle()).toBeNull();
  });

  it('says there are no changes yet when there are none', () => {
    render([]);

    expect(section().querySelector('.empty').textContent).toContain('kym.noChanges');
    expect(toggle()).toBeNull();
  });

  it('reloads the changes after a save and keeps them expanded', () => {
    render(changes(6));
    toggle().click();
    redraw();

    history = changes(7);
    component.load();
    redraw();

    expect(kymService.history).toHaveBeenCalledTimes(2);
    expect(shownRows()).toBe(7);
  });

  it('shows the main occupation by its label and name, not occupationId and the id', () => {
    render([]);
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', { kym: { field: { occupation: 'Main occupation' } } });
    translate.use('en');

    expect(component.fieldName('occupationId')).toBe('Main occupation');
    expect(component.valueText('occupationId', '80')).toBe('Business owner');
    // An id no longer in the list still shows, rather than a blank.
    expect(component.valueText('occupationId', '99')).toBe('99');
  });
});
