/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { DatePipe } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';

import { KymEditDialogComponent } from './kym-edit-dialog.component';
import { KymService } from '../kym.service';

/** A member's KYM answers with nothing filled in. */
const values: any = {
  maritalStatus: null,
  familyType: null,
  occupationId: null,
  occupationDetail: null,
  noPan: false,
  pepDeclared: null,
  pepName: null,
  pepSelf: false,
  pepRelationshipCode: null,
  pepRelationshipDetail: null,
  pepPost: null,
  guardianName: null,
  workingAreaResidence: null,
  timeInWorkingArea: null,
  votingPollingPlace: null,
  purposeOfJoining: null,
  incomeBand: null,
  expectedTransactionsYear: null,
  expectedDepositYear: null,
  expectedBorrowing: null,
  otherCoopMember: null,
  otherCoopPurpose: null,
  familyOtherCoopMember: null,
  familyOtherCoopPurpose: null,
  familyInThisCoop: null,
  foundingMember: null,
  someoneElseDirects: null,
  declarationAccepted: null,
  remarks: null,
  otherCoops: [],
  familyHere: [],
  incomeSources: [],
  recommenders: []
};

describe('KymEditDialogComponent: Save', () => {
  let fixture: ComponentFixture<KymEditDialogComponent>;
  let component: KymEditDialogComponent;
  let kymService: { update: jest.Mock };
  /** The elements scrolled into view, in order. */
  let scrolled: Element[];
  const originalScrollIntoView = Element.prototype.scrollIntoView;

  const saveButton = (): HTMLButtonElement => fixture.nativeElement.querySelector('button[type="submit"]');
  const inPersonError = (): HTMLElement | null => fixture.nativeElement.querySelector('.confirm__error');
  const change = (patch: Record<string, unknown>) => {
    component.form.patchValue(patch);
    fixture.componentRef.changeDetectorRef.markForCheck();
    fixture.detectChanges();
  };

  beforeEach(() => {
    scrolled = [];
    Element.prototype.scrollIntoView = jest.fn(function (this: Element) {
      scrolled.push(this);
    }) as any;
    kymService = { update: jest.fn(() => of({ values })) };

    TestBed.configureTestingModule({
      imports: [
        KymEditDialogComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        DatePipe,
        provideNoopAnimations(),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MAT_DIALOG_DATA, useValue: { clientId: 793, kym: { values }, professions: [] } },
        { provide: MatDialogRef, useValue: { close: jest.fn() } },
        { provide: KymService, useValue: kymService }
      ]
    });
    fixture = TestBed.createComponent(KymEditDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    Element.prototype.scrollIntoView = originalScrollIntoView;
  });

  it('stays disabled while nothing has changed', () => {
    expect(saveButton().disabled).toBe(true);
  });

  it('is clickable once a field changes, even with "here in person" unticked', () => {
    change({ maritalStatus: 'MARRIED' });

    expect(saveButton().disabled).toBe(false);
  });

  it('sends nothing, explains, and scrolls to the "here in person" box when it is unticked', () => {
    change({ maritalStatus: 'MARRIED' });

    saveButton().click();
    fixture.detectChanges();

    expect(kymService.update).not.toHaveBeenCalled();
    expect(inPersonError()?.textContent).toContain('kym.inPersonRequired');
    expect(fixture.nativeElement.querySelector('.confirm').classList).toContain('confirm--invalid');
    expect(scrolled[0].getAttribute('formcontrolname')).toBe('inPerson');
    expect(scrolled[0].contains(document.activeElement)).toBe(true);
  });

  it('scrolls to the first invalid field when another field comes before the box', () => {
    change({ remarks: 'x'.repeat(1001) });

    saveButton().click();
    fixture.detectChanges();

    expect(kymService.update).not.toHaveBeenCalled();
    expect(scrolled[0].getAttribute('formcontrolname')).toBe('remarks');
  });

  it('saves only what changed once the box is ticked, as before', () => {
    change({ maritalStatus: 'MARRIED', inPerson: true, changeHappenedOn: new Date(2026, 10, 22) });

    saveButton().click();

    expect(kymService.update).toHaveBeenCalledWith(793, {
      maritalStatus: 'MARRIED',
      inPerson: true,
      changeHappenedOn: '2026-11-22'
    });
    expect(inPersonError()).toBeNull();
  });
});

describe('KymEditDialogComponent: Fill in', () => {
  let fixture: ComponentFixture<KymEditDialogComponent>;
  /** The elements scrolled into view, in order. */
  let scrolled: Element[];
  const originalScrollIntoView = Element.prototype.scrollIntoView;

  /** Opens the dialog from "Fill in" next to a missing item. */
  function openFor(focus: string, answers: Record<string, unknown> = {}) {
    TestBed.configureTestingModule({
      imports: [
        KymEditDialogComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        DatePipe,
        provideNoopAnimations(),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: MAT_DIALOG_DATA,
          useValue: { clientId: 793, kym: { values: { ...values, ...answers } }, professions: [], focus }
        },
        // The dialog has opened (and placed its own focus) as soon as it is shown here.
        { provide: MatDialogRef, useValue: { close: jest.fn(), afterOpened: () => of(undefined) } },
        { provide: KymService, useValue: { update: jest.fn(), searchMembers: jest.fn(() => of([])) } }
      ]
    });
    fixture = TestBed.createComponent(KymEditDialogComponent);
    fixture.detectChanges();
  }

  const host = (): HTMLElement => fixture.nativeElement;
  const active = (): Element | null => document.activeElement;

  beforeEach(() => {
    scrolled = [];
    Element.prototype.scrollIntoView = jest.fn(function (this: Element) {
      scrolled.push(this);
    }) as any;
  });

  afterEach(() => {
    Element.prototype.scrollIntoView = originalScrollIntoView;
    jest.useRealTimers();
  });

  it.each([
    [
      'expectedTransactions',
      'expectedTransactionsYear'
    ],
    [
      'expectedDeposit',
      'expectedDepositYear'
    ],
    [
      'expectedBorrowing',
      'expectedBorrowing'
    ]
  ])('%s: shows the "Income and transactions" heading and focuses %s', (item, controlName) => {
    openFor(item);

    expect(scrolled[0].id).toBe('kym-income');
    expect(active()?.getAttribute('formcontrolname')).toBe(controlName);
    expect(active()?.closest('mat-form-field')?.classList).toContain('kym-target');
  });

  it("focuses the item's own field for other items too", () => {
    openFor('maritalStatus');

    expect(scrolled[0].id).toBe('kym-family');
    expect(active()?.getAttribute('formcontrolname')).toBe('maritalStatus');
  });

  it("focuses the first question when the item's field only shows after it is answered", () => {
    // PEP details show only once "yes" is answered: the yes/no comes first.
    openFor('pepDetails');

    expect(scrolled[0].id).toBe('kym-pep');
    expect(active()?.closest('mat-radio-group')?.getAttribute('formcontrolname')).toBe('pepDeclared');
    expect(host().querySelector('mat-radio-group[formcontrolname="pepDeclared"]').classList).toContain('kym-target');
  });

  it('focuses the declaration checkbox for the declaration', () => {
    openFor('declaration');

    expect(scrolled[0].id).toBe('kym-declare');
    expect(active()?.closest('mat-checkbox')?.getAttribute('formcontrolname')).toBe('declarationAccepted');
  });

  it('takes the highlight off again after a moment', () => {
    jest.useFakeTimers();
    openFor('expectedDeposit');
    const box = host().querySelector('[formcontrolname="expectedDepositYear"]').closest('mat-form-field');
    expect(box.classList).toContain('kym-target');

    jest.advanceTimersByTime(1500);

    expect(box.classList).not.toContain('kym-target');
  });

  it('does nothing when opened without an item', () => {
    openFor(undefined);

    expect(scrolled).toEqual([]);
    expect(host().querySelector('.kym-target')).toBeNull();
  });
});

describe('KymEditDialogComponent: expected activity messages', () => {
  let fixture: ComponentFixture<KymEditDialogComponent>;
  let component: KymEditDialogComponent;

  const errorFor = (name: string): string | null => {
    const box = fixture.nativeElement.querySelector(`[formcontrolname="${name}"]`).closest('mat-form-field');
    return box.querySelector('mat-error')?.textContent.trim() ?? null;
  };
  const enter = (name: string, value: unknown) => {
    component.form.get(name).setValue(value);
    component.form.get(name).markAsTouched();
    fixture.componentRef.changeDetectorRef.markForCheck();
    fixture.detectChanges();
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        KymEditDialogComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        DatePipe,
        provideNoopAnimations(),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MAT_DIALOG_DATA, useValue: { clientId: 793, kym: { values }, professions: [] } },
        { provide: MatDialogRef, useValue: { close: jest.fn() } },
        { provide: KymService, useValue: { update: jest.fn() } }
      ]
    });
    fixture = TestBed.createComponent(KymEditDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('explains a transactions count above 10,00,000', () => {
    enter('expectedTransactionsYear', 4300000);

    expect(component.form.get('expectedTransactionsYear').hasError('max')).toBe(true);
    expect(errorFor('expectedTransactionsYear')).toBe('kym.transactionsCountError');
  });

  it('explains a negative or decimal transactions count', () => {
    enter('expectedTransactionsYear', -1);
    expect(errorFor('expectedTransactionsYear')).toBe('kym.transactionsCountError');

    enter('expectedTransactionsYear', 12.5);
    expect(component.form.get('expectedTransactionsYear').hasError('pattern')).toBe(true);
    expect(errorFor('expectedTransactionsYear')).toBe('kym.transactionsCountError');
  });

  it('accepts a whole number from 0 to 10,00,000', () => {
    for (const ok of [
      0,
      250,
      1000000
    ]) {
      enter('expectedTransactionsYear', ok);
      expect(component.form.get('expectedTransactionsYear').valid).toBe(true);
      expect(errorFor('expectedTransactionsYear')).toBeNull();
    }
  });

  it('explains a negative expected deposit or borrowing', () => {
    enter('expectedDepositYear', -5);
    enter('expectedBorrowing', -5);

    expect(errorFor('expectedDepositYear')).toBe('kym.notNegative');
    expect(errorFor('expectedBorrowing')).toBe('kym.notNegative');
  });
});
