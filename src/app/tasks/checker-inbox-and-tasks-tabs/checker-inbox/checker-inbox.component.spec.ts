/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { DatePipe } from '@angular/common';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faCheck, faSearch, faTimes, faTrash, faUndo } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';
import { Observable, of, Subject } from 'rxjs';

import { ClientsService } from 'app/clients/clients.service';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { SettingsService } from 'app/settings/settings.service';
import { TasksService } from '../../tasks.service';
import { CheckerInboxComponent } from './checker-inbox.component';

/** The slice of the `/clients` search response the customer autocomplete reads. */
interface CustomerOption {
  id: number;
  displayName: string;
}

interface CustomerLookupResponse {
  content: CustomerOption[];
}

describe('CheckerInboxComponent advanced-search reset', () => {
  let component: CheckerInboxComponent;
  let fixture: ComponentFixture<CheckerInboxComponent>;
  let searchByText: jest.Mock;
  let getMakerCheckerData: jest.Mock;

  const record = { id: 23, actionName: 'UPDATE', entityName: 'CLIENT', resourceId: 1, madeOnDate: 1789064261493 };

  function createComponent(customerLookup: Observable<CustomerLookupResponse> = of({ content: [] })) {
    searchByText = jest.fn(() => customerLookup);
    getMakerCheckerData = jest.fn(() => of([record]));

    TestBed.configureTestingModule({
      imports: [
        CheckerInboxComponent,
        TranslateModule.forRoot(),
        NoopAnimationsModule
      ],
      providers: [
        DatePipe,
        provideRouter([]),
        { provide: TasksService, useValue: { getMakerCheckerData } },
        { provide: ClientsService, useValue: { searchByText } },
        { provide: MatDialog, useValue: { open: jest.fn() } },
        { provide: AuthenticationService, useValue: { getCredentials: () => ({ permissions: ['ALL_FUNCTIONS'] }) } },
        { provide: SettingsService, useValue: { dateFormat: 'dd MMMM yyyy', language: { code: 'en' } } },
        {
          provide: ActivatedRoute,
          useValue: {
            data: of({
              makerCheckerResource: [record],
              makerCheckerTemplate: { actionNames: ['UPDATE'], entityNames: ['CLIENT'] }
            })
          }
        }
      ]
    });

    TestBed.inject(FaIconLibrary).addIcons(faCheck, faSearch, faTimes, faTrash, faUndo);

    fixture = TestBed.createComponent(CheckerInboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('clears every filter, the customer control and the options, then reloads', () => {
    createComponent();
    component.makerCheckerSearchForm.patchValue({
      makerDateTimeFrom: new Date(2026, 0, 1),
      makerDateTimeTo: new Date(2026, 11, 31),
      actionName: 'UPDATE',
      entityName: 'CLIENT',
      resourceId: '1'
    });
    component.customerControl.setValue({ id: 1, displayName: 'Web Tester' });
    component.customers = [{ id: 1, displayName: 'Web Tester' }];

    component.resetFilters();

    expect(component.makerCheckerSearchForm.value).toEqual({
      makerDateTimeFrom: null,
      makerDateTimeTo: null,
      actionName: null,
      entityName: null,
      resourceId: null
    });
    expect(component.customerControl.value).toBe('');
    expect(component.customers).toEqual([]);
    expect(getMakerCheckerData).toHaveBeenCalled();
  });

  it('does not send a cleared filter as a query parameter', () => {
    createComponent();
    component.makerCheckerSearchForm.patchValue({ actionName: 'UPDATE', resourceId: '1' });

    component.resetFilters();

    const params = getMakerCheckerData.mock.calls.at(-1)[0];
    expect(params.actionName).toBeNull();
    expect(params.resourceId).toBeNull();
    expect(params.clientId).toBeUndefined();
  });

  it('drops a customer lookup that resolves after the reset', fakeAsync(() => {
    const lookup = new Subject<CustomerLookupResponse>();
    createComponent(lookup);

    component.customerControl.setValue('web');
    tick(300);
    expect(searchByText).toHaveBeenCalledWith('web', 0, 20);

    component.resetFilters();
    lookup.next({ content: [{ id: 1, displayName: 'Web Tester' }] });
    lookup.complete();

    // Asserted inside the debounce window: switchMap has not cancelled the lookup yet,
    // so only the subscriber's guard can keep the stale options out.
    expect(component.customers).toEqual([]);

    tick(300);
    expect(component.customers).toEqual([]);
  }));
});
