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

  interface CalendarAgingTestComponent {
    daysBetween(start: Date, end: Date): number;
  }

  beforeEach(async () => {
    jest.useFakeTimers().setSystemTime(new Date(2026, 8, 10));
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
    jest.useRealTimers();
    environment.productionModeEnableRBAC = rbacEnabled;
  });

  function createComponent(): void {
    fixture = TestBed.createComponent(OnboardingBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  function mockClientTasks(
    pageItems: Array<{ id: number; displayName: string; accountNo: string; submittedOnDate?: number[] | string | null }>
  ): void {
    tasksService.getGroupedClientsData.mockReturnValue(
      of({
        pageItems: pageItems.map((item) => ({
          id: item.id,
          displayName: item.displayName,
          accountNo: item.accountNo,
          officeName: 'North',
          status: { value: 'Pending' },
          timeline: 'submittedOnDate' in item ? { submittedOnDate: item.submittedOnDate } : undefined
        }))
      })
    );
    tasksService.getAllLoansToBeApproved.mockReturnValue(of({ pageItems: [] }));
    tasksService.getAllSavingsToBeApproved.mockReturnValue(of({ pageItems: [] }));
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
          status: { value: 'Pending' },
          timeline: { submittedOnDate: [
              2026,
              9,
              9
            ] }
        }
      ]
    });
    clients.complete();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Amina Yusuf');
    expect(fixture.nativeElement.textContent).toContain('000007');
    expect(fixture.nativeElement.querySelector('.aging-indicator')).toBeTruthy();
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

  it('renders neutral today aging for tasks submitted today', () => {
    mockClientTasks([
      {
        id: 1,
        displayName: 'Today',
        accountNo: '100',
        submittedOnDate: [
          2026,
          9,
          10
        ]
      }
    ]);

    createComponent();

    const indicator = fixture.nativeElement.querySelector('.aging-indicator');
    expect(indicator.classList).toContain('aging-neutral');
    expect(indicator.textContent).toContain('labels.text.Today');
    expect(indicator.getAttribute('aria-label')).toContain('labels.text.Aging days');
  });

  it('renders yellow aging indicators for tasks submitted 1 to 5 days ago', () => {
    mockClientTasks([
      {
        id: 1,
        displayName: 'One Day',
        accountNo: '100',
        submittedOnDate: [
          2026,
          9,
          9
        ]
      },
      {
        id: 2,
        displayName: 'Five Days',
        accountNo: '200',
        submittedOnDate: [
          2026,
          9,
          5
        ]
      }
    ]);

    createComponent();

    const indicators = fixture.nativeElement.querySelectorAll('.aging-indicator');
    expect(indicators).toHaveLength(2);
    expect(indicators[0].textContent).toContain('1 labels.inputs.day');
    expect(indicators[0].textContent).not.toContain('labels.inputs.Yellow');
    expect(indicators[0].getAttribute('aria-label')).toContain('labels.text.Aging day');
    expect(indicators[1].textContent).toContain('5 labels.inputs.days');
    expect(indicators[1].textContent).not.toContain('labels.inputs.Yellow');
    expect(indicators[1].getAttribute('aria-label')).toContain('labels.text.Aging days');
    indicators.forEach((indicator: HTMLElement) => {
      expect(indicator.classList).toContain('aging-yellow');
    });
  });

  it('renders orange aging indicators for tasks submitted 6 to 10 days ago', () => {
    mockClientTasks([
      {
        id: 1,
        displayName: 'Six Days',
        accountNo: '100',
        submittedOnDate: [
          2026,
          9,
          4
        ]
      },
      {
        id: 2,
        displayName: 'Ten Days',
        accountNo: '200',
        submittedOnDate: [
          2026,
          8,
          31
        ]
      }
    ]);

    createComponent();

    const indicators = fixture.nativeElement.querySelectorAll('.aging-indicator');
    expect(indicators).toHaveLength(2);
    indicators.forEach((indicator: HTMLElement) => {
      expect(indicator.classList).toContain('aging-orange');
      expect(indicator.textContent).toContain('labels.inputs.days');
      expect(indicator.textContent).not.toContain('labels.inputs.Orange');
      expect(indicator.getAttribute('aria-label')).toContain('labels.text.Aging days');
    });
  });

  it('renders red aging indicators for tasks submitted more than 10 days ago', () => {
    mockClientTasks([
      {
        id: 1,
        displayName: 'Eleven Days',
        accountNo: '100',
        submittedOnDate: [
          2026,
          8,
          30
        ]
      }
    ]);

    createComponent();

    const indicator = fixture.nativeElement.querySelector('.aging-indicator');
    expect(indicator.classList).toContain('aging-red');
    expect(indicator.textContent).toContain('11 labels.inputs.days');
    expect(indicator.textContent).not.toContain('labels.inputs.Red');
    expect(indicator.getAttribute('aria-label')).toContain('labels.text.Aging days');
  });

  it('parses Fineract YYYY-MM-DD strings without shifting the calendar date', () => {
    mockClientTasks([
      {
        id: 1,
        displayName: 'String Date',
        accountNo: '100',
        submittedOnDate: '2026-09-09'
      }
    ]);

    createComponent();

    const indicator = fixture.nativeElement.querySelector('.aging-indicator');
    expect(indicator.classList).toContain('aging-yellow');
    expect(indicator.getAttribute('aria-label')).toContain('labels.text.Aging day');
  });

  it('renders a neutral no-count indicator for future submitted dates', () => {
    mockClientTasks([
      {
        id: 1,
        displayName: 'Future Date',
        accountNo: '100',
        submittedOnDate: [
          2026,
          9,
          11
        ]
      }
    ]);

    createComponent();

    const indicator = fixture.nativeElement.querySelector('.aging-indicator');
    expect(indicator.classList).toContain('aging-neutral');
    expect(indicator.textContent).toContain('labels.inputs.Future submitted date');
    expect(indicator.textContent).not.toContain('-1');
    expect(indicator.getAttribute('aria-label')).toContain('labels.inputs.Future submitted date');
    expect(indicator.getAttribute('aria-label')).not.toContain('-1');
  });

  it('calculates calendar-day aging across a DST boundary', () => {
    tasksService.getGroupedClientsData.mockReturnValue(of({ pageItems: [] }));
    tasksService.getAllLoansToBeApproved.mockReturnValue(of({ pageItems: [] }));
    tasksService.getAllSavingsToBeApproved.mockReturnValue(of({ pageItems: [] }));
    createComponent();

    const previousTimezone = process.env.TZ;
    process.env.TZ = 'America/New_York';
    try {
      expect(
        (component as unknown as CalendarAgingTestComponent).daysBetween(new Date(2026, 2, 8), new Date(2026, 2, 9))
      ).toBe(1);
    } finally {
      if (previousTimezone) {
        process.env.TZ = previousTimezone;
      } else {
        delete process.env.TZ;
      }
    }
  });

  it('renders an unavailable aging indicator when submitted date is missing or null', () => {
    tasksService.getGroupedClientsData.mockReturnValue(
      of({
        pageItems: [
          { id: 1, displayName: 'Missing Date', accountNo: '100', officeName: 'North', status: { value: 'Pending' } },
          {
            id: 2,
            displayName: 'Null Date',
            accountNo: '200',
            officeName: 'South',
            status: { value: 'Pending' },
            timeline: { submittedOnDate: null }
          }
        ]
      })
    );
    tasksService.getAllLoansToBeApproved.mockReturnValue(of({ pageItems: [] }));
    tasksService.getAllSavingsToBeApproved.mockReturnValue(of({ pageItems: [] }));

    createComponent();

    const indicators = fixture.nativeElement.querySelectorAll('.aging-indicator');
    expect(indicators).toHaveLength(2);
    indicators.forEach((indicator: HTMLElement) => {
      expect(indicator.classList).toContain('aging-neutral');
      expect(indicator.textContent).toContain('labels.inputs.Unavailable');
      expect(indicator.getAttribute('aria-label')).toContain('labels.inputs.Submitted date unavailable');
    });
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
