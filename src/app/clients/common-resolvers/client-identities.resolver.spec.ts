/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot } from '@angular/router';
import { of, Subject } from 'rxjs';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

import { ClientsService } from '../clients.service';
import { ClientIdentitiesResolver } from './client-identities.resolver';

describe('ClientIdentitiesResolver', () => {
  let resolver: ClientIdentitiesResolver;
  let clientsService: jest.Mocked<ClientsService>;

  const route = {
    parent: {
      paramMap: {
        get: jest.fn(() => '11')
      }
    }
  } as unknown as ActivatedRouteSnapshot;

  beforeEach(() => {
    clientsService = {
      getClientIdentifiers: jest.fn(),
      getClientIdentificationDocuments: jest.fn()
    } as any;

    TestBed.configureTestingModule({
      providers: [
        ClientIdentitiesResolver,
        { provide: ClientsService, useValue: clientsService }
      ]
    });

    resolver = TestBed.inject(ClientIdentitiesResolver);
  });

  it('emits identities only after their documents have loaded', () => {
    const firstDocuments$ = new Subject<any[]>();
    const secondDocuments$ = new Subject<any[]>();
    const emitted: any[] = [];

    clientsService.getClientIdentifiers.mockReturnValue(
      of([
        { id: 101, documentKey: 'A-101' },
        { id: 202, documentKey: 'B-202' }
      ])
    );
    clientsService.getClientIdentificationDocuments.mockImplementation((identifierId: any) =>
      identifierId === 101 ? firstDocuments$ : secondDocuments$
    );

    resolver.resolve(route).subscribe((identities) => emitted.push(identities));

    expect(clientsService.getClientIdentifiers).toHaveBeenCalledWith('11');
    expect(clientsService.getClientIdentificationDocuments).toHaveBeenCalledWith(101);
    expect(clientsService.getClientIdentificationDocuments).toHaveBeenCalledWith(202);
    expect(emitted).toEqual([]);

    firstDocuments$.next([{ id: 1, name: 'front.png' }]);
    firstDocuments$.complete();
    expect(emitted).toEqual([]);

    secondDocuments$.next([{ id: 2, name: 'back.png' }]);
    secondDocuments$.complete();

    expect(emitted).toEqual([
      [
        { id: 101, documentKey: 'A-101', documents: [{ id: 1, name: 'front.png' }] },
        { id: 202, documentKey: 'B-202', documents: [{ id: 2, name: 'back.png' }] }
      ]
    ]);
  });

  it('emits an empty array without requesting documents when there are no identities', () => {
    const emitted: any[] = [];
    clientsService.getClientIdentifiers.mockReturnValue(of([]));

    resolver.resolve(route).subscribe((identities) => emitted.push(identities));

    expect(emitted).toEqual([[]]);
    expect(clientsService.getClientIdentificationDocuments).not.toHaveBeenCalled();
  });
});
