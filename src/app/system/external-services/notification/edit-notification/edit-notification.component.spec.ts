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
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { of } from 'rxjs';

import { SystemService } from 'app/system/system.service';
import { EditNotificationComponent } from './edit-notification.component';

/** `GET /externalservice/NOTIFICATION`, with the server key masked as Fineract returns it. */
const NOTIFICATION_CONFIGURATION = [
  { name: 'server_key', value: 'A****************wXyz' },
  { name: 'gcm_end_point', value: 'https://gcm-http.googleapis.com/gcm/send' },
  { name: 'fcm_end_point', value: 'https://fcm.googleapis.com/fcm/send' }
];

describe('EditNotificationComponent', () => {
  let component: EditNotificationComponent;
  let fixture: ComponentFixture<EditNotificationComponent>;
  let updateExternalConfiguration: jest.Mock;

  beforeEach(async () => {
    updateExternalConfiguration = jest.fn(() => of({}));

    await TestBed.configureTestingModule({
      imports: [
        EditNotificationComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        { provide: ActivatedRoute, useValue: { data: of({ notificationConfiguration: NOTIFICATION_CONFIGURATION }) } },
        { provide: SystemService, useValue: { updateExternalConfiguration } }
      ]
    }).compileComponents();

    jest.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(EditNotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('does not put the masked server key in the form', () => {
    const serverKey = component.notificationConfigurationForm.controls.server_key;

    expect(serverKey.value).toBe('');
    expect(serverKey.valid).toBe(true);
  });

  it('keeps the stored server key when an end point is changed', () => {
    component.notificationConfigurationForm.patchValue({ fcm_end_point: 'https://fcm.example.com/send' });
    component.submit();

    expect(updateExternalConfiguration).toHaveBeenCalledWith('NOTIFICATION', {
      fcm_end_point: 'https://fcm.example.com/send'
    });
  });

  it('sends the server key when a new one is typed', () => {
    component.notificationConfigurationForm.patchValue({ server_key: 'AAAAnewKey' });
    component.submit();

    expect(updateExternalConfiguration).toHaveBeenCalledWith('NOTIFICATION', { server_key: 'AAAAnewKey' });
  });
});
