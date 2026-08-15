/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faBan, faCheck, faCircle, faLink, faTrash, faUnlink } from '@fortawesome/free-solid-svg-icons';
import { of, Subject } from 'rxjs';

import { ClientsService } from 'app/clients/clients.service';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { environment } from 'environments/environment';
import { UsersService } from '../users.service';
import { SelfServiceUsersComponent } from './self-service-users.component';

describe('SelfServiceUsersComponent', () => {
  let component: SelfServiceUsersComponent;
  let fixture: ComponentFixture<SelfServiceUsersComponent>;
  let usersService: jest.Mocked<UsersService>;
  let clientsService: jest.Mocked<ClientsService>;
  let dialog: { open: jest.Mock };
  let originalRbac: boolean;

  const users = [
    {
      id: 1,
      username: 'active-user',
      firstname: 'Active',
      lastname: 'User',
      officeName: 'Head Office',
      enabled: true,
      clients: [{ id: 10, displayName: 'Client One', officeName: 'Head Office' }]
    },
    {
      id: 2,
      username: 'inactive-user',
      firstname: 'Inactive',
      lastname: 'User',
      officeName: 'Branch',
      enabled: false,
      clients: []
    }
  ];

  beforeEach(() => {
    originalRbac = environment.productionModeEnableRBAC;
    environment.productionModeEnableRBAC = true;
  });

  afterEach(() => {
    environment.productionModeEnableRBAC = originalRbac;
  });

  function configure(userPermissions = [
      'READ_SELFSERVICEUSER',
      'UPDATE_SELFSERVICEUSER',
      'DELETE_SELFSERVICEUSER'
    ]) {
    usersService = {
      getSelfServiceUsers: jest.fn(() => of(users)),
      activateSelfServiceUser: jest.fn(() => of({})),
      inactivateSelfServiceUser: jest.fn(() => of({})),
      linkSelfServiceUserClient: jest.fn(() => of({})),
      delinkSelfServiceUserClient: jest.fn(() => of({})),
      deleteSelfServiceUser: jest.fn(() => of({}))
    } as unknown as jest.Mocked<UsersService>;
    clientsService = {
      getFilteredClients: jest.fn(() => of({ pageItems: [{ id: 11, displayName: 'Client Two' }] }))
    } as unknown as jest.Mocked<ClientsService>;
    dialog = {
      open: jest.fn(() => ({ afterClosed: () => of({ confirm: true }) }))
    };

    TestBed.configureTestingModule({
      imports: [
        SelfServiceUsersComponent,
        NoopAnimationsModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: UsersService, useValue: usersService },
        { provide: ClientsService, useValue: clientsService },
        { provide: MatDialog, useValue: dialog },
        { provide: AuthenticationService, useValue: { getCredentials: () => ({ permissions: userPermissions }) } }
      ]
    });
    TestBed.inject(FaIconLibrary).addIcons(faBan, faCheck, faCircle, faLink, faTrash, faUnlink);
    fixture = TestBed.createComponent(SelfServiceUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('loads users and renders active and inactive states', () => {
    configure();

    expect(usersService.getSelfServiceUsers).toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('active-user');
    expect(fixture.nativeElement.textContent).toContain('Inactive');
    expect(fixture.nativeElement.textContent).toContain('Client One');
  });

  it('hides mutation actions without update and delete permissions', () => {
    configure(['READ_SELFSERVICEUSER']);

    expect(fixture.nativeElement.querySelectorAll('button[mat-icon-button]').length).toBe(0);
  });

  it('sorts name by combined display name', () => {
    configure();

    expect(component.dataSource.sortingDataAccessor(users[0], 'name')).toBe('active user');
  });

  it('sorts status by enabled state', () => {
    configure();

    expect(component.dataSource.sortingDataAccessor(users[0], 'status')).toBe('active');
    expect(component.dataSource.sortingDataAccessor(users[1], 'status')).toBe('inactive');
  });

  it('activates inactive users and refreshes the list', () => {
    configure();

    component.activate(users[1]);

    expect(usersService.activateSelfServiceUser).toHaveBeenCalledWith(2);
    expect(usersService.getSelfServiceUsers).toHaveBeenCalledTimes(2);
  });

  it('inactivates active users after confirmation and refreshes the list', () => {
    configure();

    component.inactivate(users[0]);

    expect(dialog.open).toHaveBeenCalled();
    expect(usersService.inactivateSelfServiceUser).toHaveBeenCalledWith(1);
    expect(usersService.getSelfServiceUsers).toHaveBeenCalledTimes(2);
  });

  it('links selected client and refreshes linked-client data', () => {
    configure();
    component.openLinkClient(users[0]);
    component.clientChoice.setValue({ id: 11, displayName: 'Client Two' });

    component.linkClient();

    expect(usersService.linkSelfServiceUserClient).toHaveBeenCalledWith(1, 11);
    expect(usersService.getSelfServiceUsers).toHaveBeenCalledTimes(2);
  });

  it('keeps the latest client search results when responses arrive out of order', fakeAsync(() => {
    configure();
    const firstSearch = new Subject<any>();
    const secondSearch = new Subject<any>();
    clientsService.getFilteredClients
      .mockReturnValueOnce(firstSearch.asObservable())
      .mockReturnValueOnce(secondSearch.asObservable());

    component.clientChoice.setValue('cl');
    tick(300);
    component.clientChoice.setValue('cli');
    tick(300);

    secondSearch.next({ pageItems: [{ id: 12, displayName: 'Latest Client' }] });
    secondSearch.complete();
    expect(component.clientsData).toEqual([{ id: 12, displayName: 'Latest Client' }]);

    firstSearch.next({ pageItems: [{ id: 11, displayName: 'Stale Client' }] });
    firstSearch.complete();
    expect(component.clientsData).toEqual([{ id: 12, displayName: 'Latest Client' }]);
  }));

  it('delinks clients after confirmation and refreshes the list', () => {
    configure();

    component.delinkClient(users[0], users[0].clients[0]);

    expect(dialog.open).toHaveBeenCalled();
    expect(usersService.delinkSelfServiceUserClient).toHaveBeenCalledWith(1, 10);
    expect(usersService.getSelfServiceUsers).toHaveBeenCalledTimes(2);
  });

  it('deletes users after destructive confirmation and refreshes the list', () => {
    configure();

    component.delete(users[0]);

    expect(dialog.open).toHaveBeenCalled();
    expect(usersService.deleteSelfServiceUser).toHaveBeenCalledWith(1);
    expect(usersService.getSelfServiceUsers).toHaveBeenCalledTimes(2);
  });
});
