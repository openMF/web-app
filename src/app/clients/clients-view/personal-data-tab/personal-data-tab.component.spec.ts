/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject, of } from 'rxjs';
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { LegalFormId } from 'app/clients/models/legal-form.enum';
import { ClientsService } from 'app/clients/clients.service';
import { ReportsService } from 'app/reports/reports.service';
import { SettingsService } from 'app/settings/settings.service';
import { AlertService } from 'app/core/alert/alert.service';
import { SystemService } from 'app/system/system.service';
import { PersonalDataViewService } from './personal-data-view.service';
import { PersonalDataTabComponent } from './personal-data-tab.component';
import { environment } from 'environments/environment';

describe('PersonalDataTabComponent', () => {
  let fixture: ComponentFixture<PersonalDataTabComponent>;
  let routeData: BehaviorSubject<any>;
  let personalDataViewService: jest.Mocked<PersonalDataViewService>;
  const originalProductionMode = environment.productionMode;

  const baseClient = {
    id: 1,
    accountNo: '0001',
    displayName: 'Client One',
    officeName: 'Head Office',
    legalForm: {
      id: LegalFormId.PERSON,
      code: 'legalFormType.person',
      value: 'Person'
    },
    status: {
      value: 'Active'
    }
  };

  function setup(productionMode: boolean, legalFormId: number | string = LegalFormId.PERSON, legalFormValue?: string) {
    environment.productionMode = productionMode;
    const normalizedLegalFormId = Number(legalFormId);
    routeData = new BehaviorSubject({
      clientViewData: {
        ...baseClient,
        legalForm: {
          ...baseClient.legalForm,
          id: legalFormId,
          code: normalizedLegalFormId === LegalFormId.ENTITY ? 'legalFormType.entity' : 'legalFormType.person',
          value: legalFormValue || (normalizedLegalFormId === LegalFormId.ENTITY ? 'Entity' : 'Person')
        }
      },
      clientDatatables: [{ registeredTableName: 'client_socioeconomic_information' }]
    });
    personalDataViewService = {
      load: jest.fn(() =>
        of({
          addresses: [],
          familyMembers: [],
          identifiers: [],
          documents: [],
          datatableSections: {}
        })
      )
    } as unknown as jest.Mocked<PersonalDataViewService>;

    TestBed.configureTestingModule({
      imports: [
        PersonalDataTabComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            parent: {
              data: routeData.asObservable()
            }
          }
        },
        {
          provide: ClientsService,
          useValue: {
            getClientDatatable: jest.fn(() => of({ data: [] }))
          }
        },
        { provide: ReportsService, useValue: {} },
        {
          provide: SettingsService,
          useValue: { tenantIdentifier: 'default', language: { code: 'en' }, dateFormat: 'dd MMMM yyyy' }
        },
        { provide: AlertService, useValue: { alert: jest.fn() } },
        { provide: SystemService, useValue: { getConfigurations: jest.fn(() => of({ globalConfiguration: [] })) } },
        { provide: MatDialog, useValue: { open: jest.fn() } },
        { provide: PersonalDataViewService, useValue: personalDataViewService },
        DatePipe,
        provideNoopAnimations()
      ]
    });

    fixture = TestBed.createComponent(PersonalDataTabComponent);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  afterEach(() => {
    environment.productionMode = originalProductionMode;
    TestBed.resetTestingModule();
  });

  it('renders the legacy Personal Data view when productionMode is false', () => {
    const component = setup(false, LegalFormId.PERSON);

    expect(component.productionMode).toBe(false);
    expect(fixture.debugElement.query(By.css('mifosx-person-production-personal-data'))).toBeNull();
    expect(fixture.debugElement.query(By.css('mifosx-entity-production-personal-data'))).toBeNull();
    expect(personalDataViewService.load).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('labels.heading.Personal Information');
  });

  it('renders the PERSON production view when productionMode is true and legal form is PERSON', () => {
    const component = setup(true, LegalFormId.PERSON.toString());

    expect(component.productionMode).toBe(true);
    expect(component.isPerson()).toBe(true);
    expect(fixture.debugElement.query(By.css('mifosx-person-production-personal-data'))).not.toBeNull();
    expect(fixture.debugElement.query(By.css('mifosx-entity-production-personal-data'))).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('labels.heading.General Client Information');
    expect(fixture.nativeElement.textContent).not.toContain('labels.heading.Account Information');
    expect(personalDataViewService.load).toHaveBeenCalledWith(
      '1',
      [{ registeredTableName: 'client_socioeconomic_information' }],
      false
    );
  });

  it('renders the ENTITY production view when productionMode is true and legal form is ENTITY', () => {
    const component = setup(true, LegalFormId.ENTITY.toString());

    expect(component.productionMode).toBe(true);
    expect(component.isLegalEntity()).toBe(true);
    expect(fixture.debugElement.query(By.css('mifosx-person-production-personal-data'))).toBeNull();
    expect(fixture.debugElement.query(By.css('mifosx-entity-production-personal-data'))).not.toBeNull();
    expect(personalDataViewService.load).toHaveBeenCalledWith(
      '1',
      [{ registeredTableName: 'client_socioeconomic_information' }],
      true
    );
  });

  it('gives ENTITY legal form precedence over ambiguous person text', () => {
    const component = setup(true, LegalFormId.ENTITY, 'Entity Person');

    expect(component.isLegalEntity()).toBe(true);
    expect(component.isPerson()).toBe(false);
    expect(fixture.debugElement.query(By.css('mifosx-person-production-personal-data'))).toBeNull();
    expect(fixture.debugElement.query(By.css('mifosx-entity-production-personal-data'))).not.toBeNull();
  });
});
