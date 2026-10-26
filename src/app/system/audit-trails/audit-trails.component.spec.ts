/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { DatePipe } from '@angular/common';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatAutocomplete } from '@angular/material/autocomplete';
import { provideNativeDateAdapter } from '@angular/material/core';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faFile } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';

import { SettingsService } from 'app/settings/settings.service';
import { SystemService } from '../system.service';
import { AuditTrailsComponent } from './audit-trails.component';

/** One entry of the filter list the component hands to the service. */
interface AuditFilter {
  type: string;
  value: string;
}

describe('AuditTrailsComponent autocomplete filters', () => {
  let component: AuditTrailsComponent;
  let fixture: ComponentFixture<AuditTrailsComponent>;
  let requests: AuditFilter[][];

  const template = {
    appUsers: [{ id: 5, username: 'mifos' }],
    actionNames: ['CREATE'],
    entityNames: ['CLIENT'],
    processingResults: [{ id: 1, processingResult: 'approved' }]
  };

  /** The autocompletes in template order: user, action, entity, checker. */
  function autocompleteAt(index: number): MatAutocomplete {
    return fixture.debugElement.queryAll(By.directive(MatAutocomplete))[index].componentInstance;
  }

  function filterValue(request: AuditFilter[], type: string): string {
    return request.find((filter) => filter.type === type).value;
  }

  beforeEach(() => {
    requests = [];
    const getAuditTrails = jest.fn((filterBy: AuditFilter[]) => {
      requests.push(filterBy.map((filter) => ({ ...filter })));
      return of({ totalFilteredRecords: 0, pageItems: [] });
    });

    TestBed.configureTestingModule({
      imports: [
        AuditTrailsComponent,
        TranslateModule.forRoot(),
        NoopAnimationsModule
      ],
      providers: [
        DatePipe,
        provideRouter([]),
        provideNativeDateAdapter(),
        { provide: SystemService, useValue: { getAuditTrails } },
        {
          provide: SettingsService,
          useValue: { businessDate: new Date(2026, 0, 1), dateFormat: 'dd MMMM yyyy', language: { code: 'en' } }
        },
        { provide: ActivatedRoute, useValue: { data: of({ auditTrailSearchTemplate: template }) } }
      ]
    });

    TestBed.inject(FaIconLibrary).addIcons(faFile);

    fixture = TestBed.createComponent(AuditTrailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    requests = [];
  });

  it('sends no request while an option is being typed', fakeAsync(() => {
    component.user.setValue('mif');
    component.actionName.setValue('CRE');
    component.entityName.setValue('CLI');
    component.checker.setValue('mif');
    tick(500);

    expect(requests).toEqual([]);
  }));

  it('sends the selected option once it is picked', () => {
    autocompleteAt(0).optionSelected.emit({ option: { value: { id: 5, name: 'mifos' } } } as any);
    autocompleteAt(1).optionSelected.emit({ option: { value: 'CREATE' } } as any);

    expect(requests).toHaveLength(2);
    expect(filterValue(requests[0], 'makerId')).toBe(5);
    expect(filterValue(requests[1], 'actionName')).toBe('CREATE');
  });

  it('clears the filter when the field is emptied', fakeAsync(() => {
    autocompleteAt(3).optionSelected.emit({ option: { value: { id: 5, name: 'mifos' } } } as any);
    expect(filterValue(requests[0], 'checkerId')).toBe(5);

    component.checker.setValue('');
    tick(500);

    expect(requests).toHaveLength(2);
    expect(filterValue(requests[1], 'checkerId')).toBe('');
  }));

  it('sends no id when the selected user option carries none', () => {
    // `/audits/searchtemplate` can answer with app users that have no id, which used to reach the
    // server as `makerId=undefined` and come back 404.
    autocompleteAt(0).optionSelected.emit({ option: { value: { selfServiceUser: false } } } as any);

    expect(requests).toEqual([]);
  });

  it('does not reload when a filter is set to the value it already has', fakeAsync(() => {
    component.entityName.setValue('CLI');
    tick(500);
    component.entityName.setValue('');
    tick(500);

    expect(requests).toEqual([]);
  }));
});
