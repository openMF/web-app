/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { of, Subject, throwError } from 'rxjs';

import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { TasksService } from 'app/tasks/tasks.service';
import { OnboardingBoardComponent } from './onboarding-board.component';
import { environment } from 'environments/environment';

describe('OnboardingBoardComponent', () => {
  let fixture: ComponentFixture<OnboardingBoardComponent>;
  let component: OnboardingBoardComponent;
  let tasksService: {
    getGroupedClientsData: jest.Mock;
    getAllLoansToBeApproved: jest.Mock;
    getAllSavingsToBeApproved: jest.Mock;
  };
  let permissions: string[];
  const rbacEnabled = environment.productionModeEnableRBAC;

  beforeEach(async () => {
    tasksService = {
      getGroupedClientsData: jest.fn(),
      getAllLoansToBeApproved: jest.fn(),
      getAllSavingsToBeApproved: jest.fn()
    };
    permissions = ['ALL_FUNCTIONS'];

    await TestBed.configureTestingModule({
      imports: [
        OnboardingBoardComponent,
        RouterTestingModule,
        TranslateModule.forRoot()
      ],
      providers: [
        provideNoopAnimations(),
        { provide: TasksService, useValue: tasksService },
        {
          provide: AuthenticationService,
          useValue: { getCredentials: () => ({ permissions }) }
        }
      ]
    }).compileComponents();
  });

  afterEach(() => {
    environment.productionModeEnableRBAC = rbacEnabled;
  });

  function createComponent(): void {
    fixture = TestBed.createComponent(OnboardingBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('shows loading and renders pending onboarding and portfolio work', () => {
    const clients = new Subject<any>();
    tasksService.getGroupedClientsData.mockReturnValue(clients);
    tasksService.getAllLoansToBeApproved.mockReturnValue(of({ pageItems: [] }));
    tasksService.getAllSavingsToBeApproved.mockReturnValue(of({ pageItems: [] }));

    createComponent();
    expect(fixture.nativeElement.querySelector('mat-spinner')).toBeTruthy();

    clients.next({
      pageItems: [
        {
          id: 7,
          displayName: 'Amina Yusuf',
          accountNo: '000007',
          officeName: 'Head Office',
          status: { value: 'Pending' }
        }
      ]
    });
    clients.complete();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Amina Yusuf');
    expect(fixture.nativeElement.textContent).toContain('000007');
    expect(fixture.nativeElement.querySelector('a').getAttribute('href')).toContain('/clients/7/general');
  });

  it('shows the empty state', () => {
    tasksService.getGroupedClientsData.mockReturnValue(of({ pageItems: [] }));
    tasksService.getAllLoansToBeApproved.mockReturnValue(of({ pageItems: [] }));
    tasksService.getAllSavingsToBeApproved.mockReturnValue(of({ pageItems: [] }));

    createComponent();

    expect(fixture.nativeElement.textContent).toContain('labels.text.No data found');
  });

  it('shows an error and retries loading', () => {
    tasksService.getGroupedClientsData.mockReturnValue(throwError(() => new Error('network')));
    tasksService.getAllLoansToBeApproved.mockReturnValue(of({ pageItems: [] }));
    tasksService.getAllSavingsToBeApproved.mockReturnValue(of({ pageItems: [] }));

    createComponent();
    expect(fixture.nativeElement.getAttribute('role')).toBeNull();
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeTruthy();

    tasksService.getGroupedClientsData.mockReturnValue(of({ pageItems: [] }));
    fixture.nativeElement.querySelector('button').click();

    expect(tasksService.getGroupedClientsData).toHaveBeenCalledTimes(2);
  });

  it('filters tasks by customer or account data', () => {
    tasksService.getGroupedClientsData.mockReturnValue(
      of({
        pageItems: [
          { id: 1, displayName: 'Amina', accountNo: '100', officeName: 'North', status: { value: 'Pending' } },
          { id: 2, displayName: 'Benoit', accountNo: '200', officeName: 'South', status: { value: 'Pending' } }
        ]
      })
    );
    tasksService.getAllLoansToBeApproved.mockReturnValue(of({ pageItems: [] }));
    tasksService.getAllSavingsToBeApproved.mockReturnValue(of({ pageItems: [] }));

    createComponent();
    component.searchControl.setValue('200');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).not.toContain('Amina');
    expect(fixture.nativeElement.textContent).toContain('Benoit');
  });

  it('only requests task types the user has permission to read', () => {
    environment.productionModeEnableRBAC = true;
    permissions = ['READ_CLIENT'];
    tasksService.getGroupedClientsData.mockReturnValue(of({ pageItems: [] }));

    createComponent();

    expect(tasksService.getGroupedClientsData).toHaveBeenCalled();
    expect(tasksService.getAllLoansToBeApproved).not.toHaveBeenCalled();
    expect(tasksService.getAllSavingsToBeApproved).not.toHaveBeenCalled();
  });

  it('shows an empty board without making requests when no task type is permitted', () => {
    environment.productionModeEnableRBAC = true;
    permissions = [];

    createComponent();

    expect(component.loading).toBe(false);
    expect(tasksService.getGroupedClientsData).not.toHaveBeenCalled();
    expect(tasksService.getAllLoansToBeApproved).not.toHaveBeenCalled();
    expect(tasksService.getAllSavingsToBeApproved).not.toHaveBeenCalled();
  });
});
