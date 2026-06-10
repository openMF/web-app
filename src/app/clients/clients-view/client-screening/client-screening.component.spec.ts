/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { of, throwError } from 'rxjs';
import { describe, beforeEach, expect, it, jest } from '@jest/globals';
import { ClientsService } from '../../clients.service';
import { ClientScreeningService } from '../../services/client-screening.service';
import { ClientScreeningComponent } from './client-screening.component';

describe('ClientScreeningComponent', () => {
  let component: ClientScreeningComponent;
  let fixture: ComponentFixture<ClientScreeningComponent>;
  let clientsService: jest.Mocked<ClientsService>;
  let screeningService: jest.Mocked<ClientScreeningService>;

  beforeEach(async () => {
    clientsService = {
      getClientAddressData: jest.fn()
    } as any;

    screeningService = {
      enabled: true,
      screenClientName: jest.fn(),
      screenClientAddress: jest.fn()
    } as any;

    await TestBed.configureTestingModule({
      imports: [
        ClientScreeningComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: ClientsService, useValue: clientsService },
        { provide: ClientScreeningService, useValue: screeningService },
        provideAnimationsAsync()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ClientScreeningComponent);
    component = fixture.componentInstance;
    component.clientViewData = {
      id: 55,
      displayName: 'Jane Doe'
    };
    fixture.detectChanges();
  });

  it('should run name screening and store the normalized result', () => {
    screeningService.screenClientName.mockReturnValue(
      of({
        type: 'name',
        status: 'possible-match',
        matches: [
          {
            id: '1',
            caption: 'Jane Doe',
            score: 0.74,
            datasets: ['sanctions'],
            countries: [],
            addresses: []
          }
        ],
        screenedText: 'Jane Doe',
        screenedAt: '2026-06-10 10:00:00'
      } as any)
    );

    component.runNameScreening();

    expect(screeningService.screenClientName).toHaveBeenCalledWith(component.clientViewData);
    expect(component.nameScreeningResult.status).toBe('possible-match');
    expect(component.nameScreeningResult.matches).toHaveLength(1);
    expect(component.isNameLoading).toBe(false);
  });

  it('should fetch client addresses only when address screening is triggered', () => {
    const addresses = [
      {
        addressLine1: '123 Main Street',
        city: 'Nairobi',
        countryName: 'Kenya',
        isActive: true
      }
    ];

    clientsService.getClientAddressData.mockReturnValue(of(addresses as any));
    screeningService.screenClientAddress.mockReturnValue(
      of({
        type: 'address',
        status: 'clear',
        matches: [],
        screenedText: '123 Main Street, Nairobi, Kenya',
        screenedAt: '2026-06-10 10:00:00'
      } as any)
    );

    component.runAddressScreening();

    expect(clientsService.getClientAddressData).toHaveBeenCalledWith('55');
    expect(screeningService.screenClientAddress).toHaveBeenCalledWith(component.clientViewData, addresses);
    expect(component.addressScreeningResult.status).toBe('clear');
    expect(component.isAddressLoading).toBe(false);
  });

  it('should show unavailable status when no address data can be screened', () => {
    clientsService.getClientAddressData.mockReturnValue(of([] as any));
    screeningService.screenClientAddress.mockReturnValue(
      throwError(() => new Error('errors.clientScreeningMissingAddress'))
    );

    component.runAddressScreening();

    expect(component.addressScreeningResult.status).toBe('unavailable');
    expect(component.addressScreeningResult.errorMessageKey).toBe('errors.clientScreeningMissingAddress');
    expect(component.isAddressLoading).toBe(false);
  });
});
