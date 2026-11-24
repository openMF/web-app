/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { Valuer, ValuersService } from '../valuers.service';
import { ValuerDialogComponent, ValuerDialogData } from './valuer-dialog.component';

describe('ValuerDialogComponent', () => {
  let fixture: ComponentFixture<ValuerDialogComponent>;
  let component: ValuerDialogComponent;
  let valuers: { add: jest.Mock; update: jest.Mock; currentFiscalYear: jest.Mock };
  let close: jest.Mock;

  const saved: Valuer = {
    id: 7,
    name: 'Hari Shrestha',
    registered: true,
    registrationNo: 'TV-44',
    fiscalYear: 2080,
    phone: '9800000000',
    address: null,
    active: true,
    listedThisYear: false
  };

  function create(data: ValuerDialogData) {
    valuers = {
      add: jest.fn((v: object) => of({ id: 9, listedThisYear: false, ...v })),
      update: jest.fn((id: number, v: object) => of({ id, listedThisYear: false, ...v })),
      currentFiscalYear: jest.fn(() => 2083)
    };
    close = jest.fn();
    TestBed.configureTestingModule({
      imports: [
        ValuerDialogComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        provideNoopAnimations(),
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: MatDialogRef, useValue: { close } },
        { provide: ValuersService, useValue: valuers }
      ]
    });
    fixture = TestBed.createComponent(ValuerDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  const errors = (): string[] =>
    Array.from(fixture.nativeElement.querySelectorAll('mat-error')).map((e: Element) => e.textContent.trim());

  it('adds a staff valuer with only a name', () => {
    create({});
    component.form.patchValue({ name: '  Ram Thapa ' });

    component.save();

    expect(valuers.add).toHaveBeenCalledWith({
      name: 'Ram Thapa',
      registered: false,
      registrationNo: null,
      fiscalYear: 2083,
      phone: null,
      address: null,
      active: true
    });
    expect(close).toHaveBeenCalled();
  });

  it('refuses a registered valuer without a registration no. or fiscal year, before sending', () => {
    create({});
    component.form.patchValue({ name: 'Sita', registered: true, registrationNo: '   ', fiscalYear: null });

    component.save();
    fixture.detectChanges();

    expect(valuers.add).not.toHaveBeenCalled();
    expect(component.form.controls.registrationNo.hasError('required')).toBe(true);
    expect(component.form.controls.fiscalYear.hasError('required')).toBe(true);
    expect(errors()).toEqual([
      'lending.valuers.registrationNoRequired',
      'lending.valuers.fiscalYearRequired'
    ]);
  });

  it('does not ask a staff valuer for a registration no. or fiscal year', () => {
    create({});
    component.form.patchValue({ registered: true });
    component.form.patchValue({ registered: false, registrationNo: '', fiscalYear: null });

    expect(component.form.controls.registrationNo.valid).toBe(true);
    expect(component.form.controls.fiscalYear.valid).toBe(true);
  });

  it('refuses a missing name', () => {
    create({});
    component.form.patchValue({ name: '   ' });

    component.save();
    fixture.detectChanges();

    expect(valuers.add).not.toHaveBeenCalled();
    expect(errors()).toContain('lending.valuers.nameRequired');
  });

  it('changes a valuer with PUT, and can deactivate it', () => {
    create({ valuer: saved });
    expect(component.form.controls.fiscalYear.value).toBe(2080);
    // The saved year stays pickable even when it is older than the years offered.
    expect(component.years).toContain(2080);

    component.form.patchValue({ active: false });
    component.save();

    expect(valuers.update).toHaveBeenCalledWith(7, expect.objectContaining({ active: false, fiscalYear: 2080 }));
    expect(close).toHaveBeenCalled();
  });

  it('stays open when the server refuses', () => {
    create({});
    valuers.add.mockReturnValue(throwError(() => ({ status: 400 })));
    component.form.patchValue({ name: 'Ram' });

    component.save();

    expect(close).not.toHaveBeenCalled();
    expect(component.busy()).toBe(false);
  });
});
