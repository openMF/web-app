/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';

import { LogoutDialogComponent } from './logout-dialog.component';

describe('LogoutDialogComponent — i18n rendering and return values', () => {
  let fixture: ComponentFixture<LogoutDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [{ provide: MatDialogRef, useValue: { close: jest.fn() } }]
    }).compileComponents();

    fixture = TestBed.createComponent(LogoutDialogComponent);
    fixture.detectChanges();
  });

  it('renders the dialog title from the translated heading label', () => {
    const titleEl = fixture.nativeElement.querySelector('#logout-dialog-title');
    expect(titleEl).not.toBeNull();
    // The translate pipe without a loader outputs the key itself.
    expect(titleEl.textContent).toContain('labels.heading.Sign Out');
  });

  it('renders the explanatory message from the dialogContext label', () => {
    const msgEl = fixture.nativeElement.querySelector('#logout-dialog-message');
    expect(msgEl).not.toBeNull();
    expect(msgEl.textContent).toContain('labels.dialogContext.Are you sure you want to log out');
  });

  it('renders the Cancel button label from the buttons Cancel key', () => {
    const cancelBtn = fixture.nativeElement.querySelector('#logout-dialog-cancel');
    expect(cancelBtn).not.toBeNull();
    expect(cancelBtn.textContent.trim()).toContain('labels.buttons.Cancel');
  });

  it('renders the Confirm (Sign Out) button label from the buttons Sign Out key', () => {
    const confirmBtn = fixture.nativeElement.querySelector('#logout-dialog-confirm');
    expect(confirmBtn).not.toBeNull();
    expect(confirmBtn.textContent.trim()).toContain('labels.buttons.Sign Out');
  });

  it('closes the dialog with true when Confirm is clicked', () => {
    const dialogRef = TestBed.inject(MatDialogRef);
    fixture.nativeElement.querySelector('#logout-dialog-confirm').click();
    expect(dialogRef.close).toHaveBeenCalledWith(true);
  });

  it('closes the dialog with false when Cancel is clicked', () => {
    const dialogRef = TestBed.inject(MatDialogRef);
    fixture.nativeElement.querySelector('#logout-dialog-cancel').click();
    expect(dialogRef.close).toHaveBeenCalledWith(false);
  });
});
