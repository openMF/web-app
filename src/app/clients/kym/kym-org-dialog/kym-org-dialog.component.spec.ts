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

import { KymOrgDialogComponent } from './kym-org-dialog.component';
import { KymService } from '../kym.service';

describe('KymOrgDialogComponent: Save', () => {
  let fixture: ComponentFixture<KymOrgDialogComponent>;
  let component: KymOrgDialogComponent;
  let kymService: { updateOrganisation: jest.Mock };
  /** The elements scrolled into view, in order. */
  let scrolled: Element[];
  const originalScrollIntoView = Element.prototype.scrollIntoView;

  const saveButton = (): HTMLButtonElement => fixture.nativeElement.querySelector('button[type="submit"]');
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
    kymService = { updateOrganisation: jest.fn(() => of({})) };

    TestBed.configureTestingModule({
      imports: [
        KymOrgDialogComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        DatePipe,
        provideNoopAnimations(),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MAT_DIALOG_DATA, useValue: { clientId: 42, kym: { values: { organisation: {} } } } },
        { provide: MatDialogRef, useValue: { close: jest.fn() } },
        { provide: KymService, useValue: kymService }
      ]
    });
    fixture = TestBed.createComponent(KymOrgDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    Element.prototype.scrollIntoView = originalScrollIntoView;
  });

  it('stays disabled while nothing has changed, and is clickable once something has', () => {
    expect(saveButton().disabled).toBe(true);

    change({ workingArea: 'Kathmandu' });

    expect(saveButton().disabled).toBe(false);
  });

  it('sends nothing, explains, and scrolls to the "someone authorised is here" box when it is unticked', () => {
    change({ workingArea: 'Kathmandu' });

    saveButton().click();
    fixture.detectChanges();

    expect(kymService.updateOrganisation).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('.confirm__error')?.textContent).toContain('kym.org.inPersonRequired');
    expect(scrolled[0].getAttribute('formcontrolname')).toBe('inPerson');
  });

  it('saves only what changed once the box is ticked, as before', () => {
    change({ workingArea: 'Kathmandu', inPerson: true });

    saveButton().click();

    expect(kymService.updateOrganisation).toHaveBeenCalledWith(42, { workingArea: 'Kathmandu' });
  });
});
