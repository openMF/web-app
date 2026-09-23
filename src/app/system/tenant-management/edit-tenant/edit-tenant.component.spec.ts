/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { DatePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faCheckCircle, faExclamationTriangle, faLink, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Subject, of } from 'rxjs';

import { EditTenantComponent } from './edit-tenant.component';
import { TenantManagementService } from '../tenant-management.service';
import { Tenant, UpdateTenantPayload } from '../models/tenant.model';

const TENANT: Tenant = {
  id: 4,
  identifier: 'demo',
  name: 'Demo Tenant',
  timezoneId: 'UTC',
  status: 'ACTIVE',
  connection: {
    id: 4,
    schemaName: 'fineract_demo',
    schemaServer: 'db',
    schemaServerPort: '5432',
    schemaUsername: 'postgres',
    autoUpdate: true
  }
};

describe('EditTenantComponent', () => {
  let component: EditTenantComponent;
  let fixture: ComponentFixture<EditTenantComponent>;
  let updateTenant: jest.Mock;
  let testConnection: jest.Mock;

  beforeEach(async () => {
    updateTenant = jest.fn(() => of(TENANT));
    testConnection = jest.fn(() =>
      of({ reachable: true, serverReachable: true, credentialsAccepted: true, schemaPresent: true })
    );

    await TestBed.configureTestingModule({
      imports: [
        EditTenantComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        DatePipe,
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ id: '4' }) } }
        },
        {
          provide: TenantManagementService,
          useValue: {
            getTemplate: () => of({ timezones: ['UTC'], statuses: ['ACTIVE'] }),
            getTenant: () => of(TENANT),
            updateTenant,
            testConnection
          }
        }
      ]
    }).compileComponents();

    TestBed.inject(FaIconLibrary).addIcons(faLink, faCheckCircle, faTimesCircle, faExclamationTriangle);

    fixture = TestBed.createComponent(EditTenantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  /** The update the component sent, typed. */
  function sentPayload(): UpdateTenantPayload {
    return updateTenant.mock.calls[0][1] as UpdateTenantPayload;
  }

  it('keeps the stored password when the field is left blank', () => {
    component.submit();

    const payload = sentPayload();
    expect('schemaPassword' in payload).toBe(false);
    expect(payload.name).toBe('Demo Tenant');
  });

  it('refuses to save a changed host that has not been shown to work', () => {
    // A typo in the host or the user breaks the tenant exactly the way a wrong password does: the
    // stored credential is simply sent somewhere it does not work.
    component.connectionForm.controls.schemaServer.setValue('a-typo-in-the-host');

    expect(component.connectionChanged()).toBe(true);
    expect(component.connectionProven()).toBe(false);
    component.submit();

    expect(updateTenant).not.toHaveBeenCalled();
  });

  it('refuses to save when the server has no database of that name', () => {
    // credentialsAccepted alone is not enough: this points the tenant at a server that does not
    // hold its data, which the verdict above already reports as a failure.
    component.connectionForm.controls.schemaPassword.setValue('a-good-one');
    testConnection.mockReturnValue(
      of({ reachable: false, serverReachable: true, credentialsAccepted: true, schemaPresent: false })
    );
    component.testConnection();

    expect(component.verdict()?.tone).toBe('error');
    expect(component.connectionProven()).toBe(false);
    component.submit();

    expect(updateTenant).not.toHaveBeenCalled();
  });

  it('allows a change that touches nothing about reachability', () => {
    // autoUpdate decides whether migrations run, not whether the database answers.
    component.connectionForm.controls.autoUpdate.setValue(false);
    component.tenantForm.controls.name.setValue('Renamed');

    expect(component.connectionChanged()).toBe(false);
    component.submit();

    expect(updateTenant).toHaveBeenCalled();
  });

  it('refuses to save a new password that has not been shown to work', () => {
    // An unverified password is accepted by the backend and then stops the platform starting,
    // because core refuses to boot when any tenant cannot be migrated.
    component.connectionForm.controls.schemaPassword.setValue('probably-wrong');

    expect(component.connectionProven()).toBe(false);
    component.submit();

    expect(updateTenant).not.toHaveBeenCalled();
  });

  it('saves a new password once the server has accepted it', () => {
    component.connectionForm.controls.schemaPassword.setValue('the-right-one');
    component.testConnection();

    expect(component.connectionProven()).toBe(true);
    component.submit();

    expect(sentPayload().schemaPassword).toBe('the-right-one');
  });

  it('stops trusting the test once the credentials change again', () => {
    component.connectionForm.controls.schemaPassword.setValue('the-right-one');
    component.testConnection();
    expect(component.connectionProven()).toBe(true);

    component.connectionForm.controls.schemaPassword.setValue('changed-my-mind');

    expect(component.connectionProven()).toBe(false);
  });

  it('discards a probe answer that arrives after the password changed again', () => {
    // The answer describes the password it was sent with. Letting a late one land would mark a
    // password proven that was never tested, and the backend does not check it on update either.
    const inFlight = new Subject<any>();
    testConnection.mockReturnValue(inFlight);
    component.connectionForm.controls.schemaPassword.setValue('the-one-i-tested');
    component.testConnection();

    component.connectionForm.controls.schemaPassword.setValue('changed-after-testing');
    inFlight.next({ reachable: true, serverReachable: true, credentialsAccepted: true, schemaPresent: true });
    inFlight.complete();

    expect(component.probe()).toBeNull();
    expect(component.connectionProven()).toBe(false);
    expect(component.testing()).toBe(false);

    component.submit();
    expect(updateTenant).not.toHaveBeenCalled();
  });

  it('clears description and contact email with an empty string rather than omitting them', () => {
    // Omitting leaves them unchanged; an empty string is how the backend clears them.
    component.tenantForm.controls.description.setValue('');
    component.tenantForm.controls.contactEmail.setValue('');

    component.submit();

    const payload = sentPayload();
    expect(payload.description).toBe('');
    expect(payload.contactEmail).toBe('');
  });
});
