/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DatePipe, DecimalPipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { provideNativeDateAdapter } from '@angular/material/core';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import * as solidIcons from '@fortawesome/free-solid-svg-icons';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { CdkStepper } from '@angular/cdk/stepper';
import { provideRouter } from '@angular/router';

import { ClientPreviewStepComponent } from './client-preview-step.component';
import { LegalFormId } from 'app/clients/models/legal-form.enum';
import { environment } from 'environments/environment';

describe('ClientPreviewStepComponent', () => {
  let component: ClientPreviewStepComponent;
  let fixture: ComponentFixture<ClientPreviewStepComponent>;

  beforeEach(async () => {
    environment.enableClientAddressLocation = true;

    await TestBed.configureTestingModule({
      imports: [
        ClientPreviewStepComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        DatePipe,
        DecimalPipe,
        provideNativeDateAdapter(),
        { provide: CdkStepper, useValue: { previous: jest.fn() } },
        provideRouter([]),
        provideNoopAnimations()
      ]
    }).compileComponents();

    const faIconLibrary = TestBed.inject(FaIconLibrary);
    const iconList = Object.keys(solidIcons)
      .filter((key) => key !== 'fas' && key !== 'prefix' && key.startsWith('fa'))
      .map((icon) => (solidIcons as any)[icon]);
    faIconLibrary.addIcons(...iconList);

    fixture = TestBed.createComponent(ClientPreviewStepComponent);
    component = fixture.componentInstance;
    component.clientAddressFieldConfig = [
      { field: 'addressType', isEnabled: true },
      { field: 'latitude', isEnabled: true },
      { field: 'longitude', isEnabled: true }
    ];
    component.clientTemplate = {
      isAddressEnabled: true,
      address: [
        {
          addressTypeIdOptions: [
            { id: 1, name: 'Home' }
          ]
        }
      ]
    };
    component.client = {
      legalFormId: LegalFormId.PERSON,
      active: false,
      familyMembers: [],
      address: [
        {
          addressTypeId: 1,
          latitude: '12.9716',
          longitude: '77.5946'
        }
      ]
    };
  });

  it('should display address coordinates when present', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('12.9716');
    expect(fixture.nativeElement.textContent).toContain('77.5946');
  });

  it('should preserve zero coordinates as displayable values', () => {
    component.client.address = [
      {
        addressTypeId: 1,
        latitude: 0,
        longitude: '0'
      }
    ];

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('0');
  });

  it('should hide address coordinates when the location feature is disabled', () => {
    environment.enableClientAddressLocation = false;

    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).not.toContain('12.9716');
    expect(fixture.nativeElement.textContent).not.toContain('77.5946');
  });
});
