/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { DatePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faCheckCircle, faInfoCircle, faLink } from '@fortawesome/free-solid-svg-icons';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Subject, of, throwError } from 'rxjs';

import { CreateTenantComponent } from './create-tenant.component';
import { TenantManagementService } from '../tenant-management.service';
import { CreateTenantPayload, TestConnectionPayload } from '../models/tenant.model';

describe('CreateTenantComponent', () => {
  let component: CreateTenantComponent;
  let fixture: ComponentFixture<CreateTenantComponent>;
  let createTenant: jest.Mock;
  let testConnection: jest.Mock;

  const validTenant = {
    identifier: 'acme',
    name: 'Acme Microfinance',
    timezoneId: 'Asia/Kolkata',
    description: '',
    contactEmail: '',
    status: 'ACTIVE'
  };

  const validConnection = {
    schemaName: 'fineract_acme',
    schemaServer: 'db',
    schemaServerPort: '5432',
    schemaUsername: 'postgres',
    schemaPassword: 'a-database-secret',
    schemaConnectionParameters: '',
    autoUpdate: true
  };

  beforeEach(async () => {
    createTenant = jest.fn(() => of({ id: 7 }));
    testConnection = jest.fn(() =>
      of({ reachable: true, serverReachable: true, credentialsAccepted: true, schemaPresent: true })
    );

    await TestBed.configureTestingModule({
      imports: [
        CreateTenantComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        DatePipe,
        {
          provide: TenantManagementService,
          useValue: {
            getTemplate: () =>
              of({
                timezones: ['Asia/Kolkata'],
                statuses: [
                  'ACTIVE',
                  'INACTIVE',
                  'SUSPENDED'
                ]
              }),
            createTenant,
            testConnection
          }
        }
      ]
    }).compileComponents();

    TestBed.inject(FaIconLibrary).addIcons(faLink, faCheckCircle, faInfoCircle);

    fixture = TestBed.createComponent(CreateTenantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('rejects an identifier the backend would reject', () => {
    const identifier = component.tenantForm.controls.identifier;
    for (const bad of [
      'Acme',
      '-acme',
      'acme tenant',
      'acme!'
    ]) {
      identifier.setValue(bad);
      expect(identifier.valid).toBe(false);
    }
    identifier.setValue('acme-1_2');
    expect(identifier.valid).toBe(true);
  });

  it('rejects a schema name the backend would reject', () => {
    const schemaName = component.connectionForm.controls.schemaName;
    for (const bad of [
      '1fineract',
      'fineract-acme',
      'fineract acme'
    ]) {
      schemaName.setValue(bad);
      expect(schemaName.valid).toBe(false);
    }
    schemaName.setValue('_fineract_acme1');
    expect(schemaName.valid).toBe(true);
  });

  it('rejects a port outside 1-65535', () => {
    const port = component.connectionForm.controls.schemaServerPort;
    port.setValue('0');
    expect(port.valid).toBe(false);
    port.setValue('65536');
    expect(port.valid).toBe(false);
    port.setValue('5432');
    expect(port.valid).toBe(true);
  });

  it('sends the port as a string and leaves empty optional fields out', () => {
    component.tenantForm.setValue(validTenant);
    component.connectionForm.setValue(validConnection);

    component.submit();

    const payload = createTenant.mock.calls[0][0] as CreateTenantPayload;
    expect(payload.schemaServerPort).toBe('5432');
    expect(typeof payload.schemaServerPort).toBe('string');
    expect(payload.description).toBeUndefined();
    expect(payload.contactEmail).toBeUndefined();
    expect(payload.schemaConnectionParameters).toBeUndefined();
    expect(payload.identifier).toBe('acme');
  });

  it('does not submit twice while a tenant is being provisioned', () => {
    component.tenantForm.setValue(validTenant);
    component.connectionForm.setValue(validConnection);
    // Provisioning is synchronous and slow, so the second click must do nothing.
    createTenant.mockReturnValue(of());

    component.submit();
    component.submit();

    expect(createTenant).toHaveBeenCalledTimes(1);
    expect(component.submitting()).toBe(true);
  });

  it('sends the details it was given and keeps the answer', () => {
    component.connectionForm.setValue(validConnection);

    component.testConnection();

    const payload = testConnection.mock.calls[0][0] as TestConnectionPayload;
    expect(payload.schemaName).toBe('fineract_acme');
    expect(payload.schemaPassword).toBe('a-database-secret');
    expect(component.probe()?.credentialsAccepted).toBe(true);
  });

  it('confirms good credentials even though the database is not there yet', () => {
    // The ordinary state on this form. Before MX-421 the backend could not tell this apart from a
    // wrong password, and the form had to hedge about which it was.
    component.connectionForm.setValue(validConnection);
    testConnection.mockReturnValue(
      of({ reachable: false, serverReachable: true, credentialsAccepted: true, schemaPresent: false })
    );

    component.testConnection();

    expect(component.verdict()).toEqual({
      key: 'labels.text.Database will be created on submit',
      tone: 'success'
    });
  });

  it('reports a refused password as a failure', () => {
    component.connectionForm.setValue(validConnection);
    testConnection.mockReturnValue(
      of({ reachable: false, serverReachable: true, credentialsAccepted: false, schemaPresent: false })
    );

    component.testConnection();

    expect(component.verdict()).toEqual({
      key: 'labels.text.Database server refused the credentials',
      tone: 'error'
    });
  });

  it('forgets the probe once the connection details change', () => {
    component.connectionForm.setValue(validConnection);
    component.testConnection();
    expect(component.probe()).not.toBeNull();

    // The answer described the old details, so it no longer means anything.
    component.connectionForm.controls.schemaServer.setValue('other-host');
    expect(component.probe()).toBeNull();
    expect(component.verdict()).toBeNull();
  });

  it('renders the verdict it reached', () => {
    component.connectionForm.setValue(validConnection);
    testConnection.mockReturnValue(
      of({ reachable: false, serverReachable: true, credentialsAccepted: true, schemaPresent: false })
    );

    component.testConnection();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('labels.text.Database will be created on submit');
  });

  it('discards a probe answer that arrives after the details changed', () => {
    const inFlight = new Subject<any>();
    testConnection.mockReturnValue(inFlight);
    component.connectionForm.setValue(validConnection);
    component.testConnection();

    component.connectionForm.controls.schemaServer.setValue('a-different-host');
    inFlight.next({ reachable: true, serverReachable: true, credentialsAccepted: true, schemaPresent: true });
    inFlight.complete();

    // The verdict would otherwise describe a host the user is no longer pointing at.
    expect(component.probe()).toBeNull();
    expect(component.verdict()).toBeNull();
    expect(component.testing()).toBe(false);
  });

  it('lets the form be submitted again after a failure', () => {
    component.tenantForm.setValue(validTenant);
    component.connectionForm.setValue(validConnection);
    createTenant.mockReturnValue(throwError(() => new Error('refused')));

    component.submit();

    expect(component.submitting()).toBe(false);
  });
});
