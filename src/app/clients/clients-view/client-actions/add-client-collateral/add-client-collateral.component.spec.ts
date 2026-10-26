/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AddClientCollateralComponent } from './add-client-collateral.component';
import { ClientsService } from 'app/clients/clients.service';
import { ProductsService } from 'app/products/products.service';
import { SettingsService } from 'app/settings/settings.service';
import { provideNativeDateAdapter } from '@angular/material/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ClientActionNotifierService } from '../client-action-notifier.service';

import { TranslateModule } from '@ngx-translate/core';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

describe('AddClientCollateralComponent', () => {
  let component: AddClientCollateralComponent;
  let fixture: ComponentFixture<AddClientCollateralComponent>;

  let clientsService: jest.Mocked<ClientsService>;
  let productsService: jest.Mocked<ProductsService>;
  let settingsService: SettingsService;
  let notifier: jest.Mocked<ClientActionNotifierService>;

  const clientId = '456';

  const setup = async () => {
    clientsService = {
      createClientCollateral: jest.fn(() => of({}))
    } as any;

    productsService = {
      getCollateral: jest.fn(() => of({ name: 'Gold', quality: 'High', unitType: 'kg', basePrice: 100, pctToBase: 50 }))
    } as any;

    settingsService = {
      language: { code: 'en' }
    } as any;

    notifier = { notifyAndNavigate: jest.fn(), notify: jest.fn() } as any;

    await TestBed.configureTestingModule({
      imports: [
        AddClientCollateralComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            data: of({ clientActionData: [] }),
            parent: { snapshot: { params: { clientId } } }
          }
        },
        { provide: ClientsService, useValue: clientsService },
        { provide: ProductsService, useValue: productsService },
        { provide: SettingsService, useValue: settingsService },
        { provide: ClientActionNotifierService, useValue: notifier },
        provideNativeDateAdapter(),
        provideAnimationsAsync()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AddClientCollateralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  beforeEach(setup);

  it('should initialize correctly', () => {
    expect(component.clientId).toBe(clientId);
    expect(component.clientCollateralForm).toBeDefined();
  });

  it('should call API with createClientCollateral on submit', () => {
    component.clientCollateralForm.patchValue({ collateralId: 1, quantity: 2 });

    component.submit();

    expect(clientsService.createClientCollateral).toHaveBeenCalledWith(
      clientId,
      expect.objectContaining({ collateralId: 1, quantity: 2, locale: 'en' })
    );
  });

  it('should notify and navigate after successful submission', () => {
    component.clientCollateralForm.patchValue({ collateralId: 1, quantity: 2 });

    component.submit();

    expect(notifier.notifyAndNavigate).toHaveBeenCalledWith(
      'clients.actions.addCollateral.success',
      TestBed.inject(ActivatedRoute)
    );
  });

  it('should not notify and navigate if API call fails', () => {
    clientsService.createClientCollateral.mockReturnValueOnce(throwError(() => new Error('API error')));
    component.clientCollateralForm.patchValue({ collateralId: 1, quantity: 2 });

    component.submit();

    expect(notifier.notifyAndNavigate).not.toHaveBeenCalled();
    expect(notifier.notify).toHaveBeenCalledWith('clients.actions.addCollateral.failure');
  });
});
