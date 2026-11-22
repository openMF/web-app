/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ApplicationRef } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';

import { ClientFamilyMemberDialogComponent } from './client-family-member-dialog.component';
import { SettingsService } from 'app/settings/settings.service';

describe('ClientFamilyMemberDialogComponent', () => {
  const options = {
    relationshipIdOptions: [{ id: 1, name: 'Father' }],
    genderIdOptions: [{ id: 2, name: 'Male' }],
    maritalStatusIdOptions: [{ id: 3, name: 'Single' }],
    professionIdOptions: [{ id: 4, name: 'Farmer' }]
  };

  let dialog: MatDialog;
  let app: ApplicationRef;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        DatePipe,
        provideNoopAnimations(),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: SettingsService,
          useValue: { businessDate: new Date(), language: { code: 'en' }, dateFormat: 'dd MMMM yyyy' }
        }
      ]
    });
    dialog = TestBed.inject(MatDialog);
    app = TestBed.inject(ApplicationRef);
  });

  afterEach(() => dialog.closeAll());

  /** Lets the dialog open, take focus and redraw. */
  async function settle() {
    for (let i = 0; i < 3; i++) {
      app.tick();
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
  }

  async function open(data: any): Promise<MatDialogRef<ClientFamilyMemberDialogComponent>> {
    const ref = dialog.open(ClientFamilyMemberDialogComponent, { data });
    await settle();
    return ref;
  }

  // In a browser the dialog focuses its title (cdkFocusInitial). jsdom has no layout, so it treats the
  // title as not focusable and focuses the dialog container instead; either way, First Name is never
  // auto-focused, so clicking elsewhere does not mark it touched.

  const firstNameErrorShown = () =>
    Array.from(document.querySelectorAll('mat-error')).some((error) => error.textContent.includes('First Name'));

  it('opens Add with no First Name error, with First Name not auto-focused', async () => {
    const ref = await open({ context: 'Add', options });

    expect(ref.componentInstance.familyMemberForm.controls['firstName'].touched).toBe(false);
    expect(firstNameErrorShown()).toBe(false);
    expect(document.activeElement?.getAttribute('formControlName')).not.toBe('firstName');
  });

  it('opens Edit with no First Name error, with First Name not auto-focused', async () => {
    const member = { firstName: '', lastName: 'Zura', relationshipId: 1, genderId: 2 };
    const ref = await open({ context: 'Edit', member, options });

    expect(ref.componentInstance.familyMemberForm.controls['firstName'].touched).toBe(false);
    expect(firstNameErrorShown()).toBe(false);
    expect(document.activeElement?.getAttribute('formControlName')).not.toBe('firstName');
  });

  it('shows the error once First Name is touched and left empty, and hides it when filled in', async () => {
    const ref = await open({ context: 'Add', options });
    const firstName = ref.componentInstance.familyMemberForm.controls['firstName'];

    firstName.markAsTouched();
    await settle();
    expect(firstNameErrorShown()).toBe(true);

    firstName.setValue('Yocahi');
    await settle();
    expect(firstNameErrorShown()).toBe(false);
  });

  it('shows the error and stays open when Confirm is pressed with First Name empty', async () => {
    const ref = await open({ context: 'Add', options });
    let closed = false;
    ref.afterClosed().subscribe(() => (closed = true));

    ref.componentInstance.confirm();
    await settle();

    expect(firstNameErrorShown()).toBe(true);
    expect(closed).toBe(false);
  });

  it('closes with the family member when Confirm is pressed on a complete form', async () => {
    const ref = await open({ context: 'Add', options });
    let result: any;
    ref.afterClosed().subscribe((value) => (result = value));

    ref.componentInstance.familyMemberForm.patchValue({
      firstName: 'Yocahi',
      lastName: 'Zura',
      relationshipId: 1,
      genderId: 2
    });
    ref.componentInstance.confirm();
    await settle();

    expect(result.member.firstName).toBe('Yocahi');
  });
});
