/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { of } from 'rxjs';

import { SystemService } from 'app/system/system.service';
import { EditEmailComponent } from './edit-email.component';

/** `GET /externalservice/SMTP`, with the password masked as Fineract returns it. */
const SMTP_CONFIGURATION = [
  { name: 'username', value: 'mailer@example.com' },
  { name: 'password', value: 's****rt81' },
  { name: 'host', value: 'smtp.example.com' },
  { name: 'port', value: '587' },
  { name: 'useTLS', value: 'true' },
  { name: 'fromEmail', value: 'no-reply@example.com' },
  { name: 'fromName', value: 'Mifos' }
];

describe('EditEmailComponent', () => {
  let component: EditEmailComponent;
  let fixture: ComponentFixture<EditEmailComponent>;
  let updateExternalConfiguration: jest.Mock;

  beforeEach(async () => {
    updateExternalConfiguration = jest.fn(() => of({}));

    await TestBed.configureTestingModule({
      imports: [
        EditEmailComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        { provide: ActivatedRoute, useValue: { data: of({ emailConfiguration: SMTP_CONFIGURATION }) } },
        { provide: SystemService, useValue: { updateExternalConfiguration } }
      ]
    }).compileComponents();

    TestBed.inject(FaIconLibrary).addIcons(faEye, faEyeSlash);
    jest.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(EditEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('does not put the masked password in the form', () => {
    const password = component.emailConfigurationForm.controls.password;

    expect(password.value).toBe('');
    expect(password.valid).toBe(true);
  });

  it('keeps the stored password when another setting is changed', () => {
    component.emailConfigurationForm.patchValue({ host: 'mail.example.com' });
    component.submit();

    expect(updateExternalConfiguration).toHaveBeenCalledWith('SMTP', { host: 'mail.example.com' });
  });

  it('sends the password when a new one is typed', () => {
    component.emailConfigurationForm.patchValue({ password: 'n3w-secret' });
    component.submit();

    expect(updateExternalConfiguration).toHaveBeenCalledWith('SMTP', { password: 'n3w-secret' });
  });

  it('sends no request when nothing changed', () => {
    component.submit();

    expect(updateExternalConfiguration).not.toHaveBeenCalled();
  });
});
