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

describe('KymEditDialogComponent: Save', () => {
  let fixture: ComponentFixture<KymEditDialogComponent>;
  let component: KymEditDialogComponent;
  let kymService: { update: jest.Mock };
  /** The elements scrolled into view, in order. */
  let scrolled: Element[];
  const originalScrollIntoView = Element.prototype.scrollIntoView;

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
