/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { DatePipe } from '@angular/common';
import { of, throwError } from 'rxjs';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

import { ClientsService } from 'app/clients/clients.service';
import { SettingsService } from 'app/settings/settings.service';
import { PersonalDataViewService } from './personal-data-view.service';

describe('PersonalDataViewService', () => {
  let service: PersonalDataViewService;
  let clientsService: jest.Mocked<ClientsService>;

  beforeEach(() => {
    clientsService = {
      getClientAddressData: jest.fn(() => of([{ addressId: 1, addressType: 'Home' }])),
      getClientAddressTemplate: jest.fn(() =>
        of({
          stateProvinceIdOptions: [{ id: 20, name: 'Jalisco' }],
          countryIdOptions: [{ id: 30, name: 'Mexico' }]
        })
      ),
      getClientFamilyMembers: jest.fn(() => of([{ id: 2, firstName: 'Ana' }])),
      getClientIdentifiers: jest.fn(() => of([{ id: 3, documentKey: 'ABC' }])),
      getClientIdentificationDocuments: jest.fn(() => of([{ id: 4, name: 'ID' }])),
      getClientDocuments: jest.fn(() => of([{ id: 5, name: 'Proof' }])),
      getClientDatatable: jest.fn(() =>
        of({
          columnHeaders: [
            { columnName: 'id' },
            { columnName: 'occupation', columnDisplayType: 'STRING', isColumnNullable: true },
            { columnName: 'income_range', columnDisplayType: 'STRING', isColumnNullable: true }
          ],
          data: [{ row: [
                1,
                'Engineer',
                'Medium'
              ] }]
        })
      )
    } as unknown as jest.Mocked<ClientsService>;

    TestBed.configureTestingModule({
      providers: [
        PersonalDataViewService,
        DatePipe,
        {
          provide: SettingsService,
          useValue: {
            maxAllowedDate: new Date(2024, 0, 1)
          }
        },
        { provide: ClientsService, useValue: clientsService }
      ]
    });

    service = TestBed.inject(PersonalDataViewService);
  });

  it('loads existing client address, reference, identifier, document, and datatable data', (done) => {
    service
      .load(
        '11',
        [
          {
            registeredTableName: 'client_socioeconomic_information'
          }
        ],
        false
      )
      .subscribe((viewModel) => {
        expect(viewModel.addresses).toHaveLength(1);
        expect(viewModel.addressTemplate?.stateProvinceIdOptions[0].name).toBe('Jalisco');
        expect(viewModel.familyMembers).toHaveLength(1);
        expect(viewModel.identifiers[0].documents).toHaveLength(1);
        expect(viewModel.documents).toHaveLength(1);
        expect(viewModel.datatableSections.socioeconomic[0].records[0].fields).toEqual([
          { label: 'Occupation', columnName: 'occupation', value: 'Engineer' },
          { label: 'Income Range', columnName: 'income_range', value: 'Medium' }
        ]);
        expect(viewModel.datatableSections.socioeconomic[0].columns).toEqual([
          expect.objectContaining({ columnName: 'occupation', columnDisplayType: 'STRING' }),
          expect.objectContaining({ columnName: 'income_range', columnDisplayType: 'STRING' })
        ]);
        expect(viewModel.datatableSections.socioeconomic[0].isMultiRow).toBe(true);
        expect(clientsService.getClientDatatable).toHaveBeenCalledWith('11', 'client_socioeconomic_information');
        done();
      });
  });

  it('loads entity representative datatables when metadata names match the requested sections', (done) => {
    service.load('12', [{ registeredTableName: 'entity_legal_representative' }], true).subscribe((viewModel) => {
      expect(viewModel.datatableSections.legalRepresentative).toHaveLength(1);
      expect(viewModel.datatableSections.legalRepresentative[0].sourceName).toBe('entity_legal_representative');
      done();
    });
  });

  it('keeps entity representative address and beneficial-owner declaration datatables in their PDF sections', (done) => {
    service
      .load(
        '12',
        [
          { registeredTableName: 'entity_address_legal_representative' },
          { registeredTableName: 'entity_address_authorized_representative' },
          { registeredTableName: 'entity_ubo_legal_entities' },
          { registeredTableName: 'entity_ubo_natural_persons' },
          { registeredTableName: 'entity_controlling_person_pep_questions' }
        ],
        true
      )
      .subscribe((viewModel) => {
        expect(viewModel.datatableSections.addressLegalRepresentative[0].sourceName).toBe(
          'entity_address_legal_representative'
        );
        expect(viewModel.datatableSections.addressAuthorizedRepresentative[0].sourceName).toBe(
          'entity_address_authorized_representative'
        );
        expect(viewModel.datatableSections.uboLegalEntities[0].sourceName).toBe('entity_ubo_legal_entities');
        expect(viewModel.datatableSections.uboNaturalPersons[0].sourceName).toBe('entity_ubo_natural_persons');
        expect(viewModel.datatableSections.controllingPersonPepQuestions[0].sourceName).toBe(
          'entity_controlling_person_pep_questions'
        );
        done();
      });
  });

  it('returns empty optional sections when APIs or datatables are unavailable', (done) => {
    clientsService.getClientAddressData.mockReturnValue(throwError(() => new Error('missing')));
    clientsService.getClientFamilyMembers.mockReturnValue(throwError(() => new Error('missing')));
    clientsService.getClientIdentifiers.mockReturnValue(throwError(() => new Error('missing')));
    clientsService.getClientDocuments.mockReturnValue(throwError(() => new Error('missing')));
    clientsService.getClientDatatable.mockReturnValue(throwError(() => new Error('missing')));

    service.load('13', [{ registeredTableName: 'client_beneficiaries' }], false).subscribe((viewModel) => {
      expect(viewModel.addresses).toEqual([]);
      expect(viewModel.familyMembers).toEqual([]);
      expect(viewModel.identifiers).toEqual([]);
      expect(viewModel.documents).toEqual([]);
      expect(viewModel.datatableSections.beneficiaries[0].records).toEqual([]);
      expect(viewModel.datatableSections.beneficiaries[0].columns).toEqual([]);
      done();
    });
  });

  it('keeps DataTable metadata columns when a client has no existing row data', (done) => {
    clientsService.getClientDatatable.mockReturnValue(of({ columnHeaders: [], data: [] }));

    service
      .load(
        '13',
        [
          {
            registeredTableName: 'client_personal_references',
            columnHeaderData: [
              { columnName: 'id' },
              { columnName: 'reference_name', columnDisplayType: 'STRING', isColumnNullable: false },
              { columnName: 'phone', columnDisplayType: 'STRING', isColumnNullable: true }
            ]
          }
        ],
        false
      )
      .subscribe((viewModel) => {
        expect(viewModel.datatableSections.personalReferences[0].records).toEqual([]);
        expect(viewModel.datatableSections.personalReferences[0].columns).toEqual([
          expect.objectContaining({ columnName: 'reference_name', label: 'Reference Name' }),
          expect.objectContaining({ columnName: 'phone', label: 'Phone' })
        ]);
        expect(viewModel.datatableSections.personalReferences[0].isMultiRow).toBe(true);
        done();
      });
  });
});
