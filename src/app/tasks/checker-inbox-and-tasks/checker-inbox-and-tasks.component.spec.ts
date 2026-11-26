/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Route as AngularRoute, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';

import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { environment } from 'environments/environment';
import { CreditApplicationsComponent } from '../checker-inbox-and-tasks-tabs/credit-applications/credit-applications.component';
import { PendingProspectsComponent } from '../checker-inbox-and-tasks-tabs/pending-prospects/pending-prospects.component';
import { routes } from '../tasks-routing.module';
import { CheckerInboxCountService } from '../checker-inbox-count.service';
import { CheckerInboxAndTasksComponent } from './checker-inbox-and-tasks.component';

describe('CheckerInboxAndTasksComponent', () => {
  let fixture: ComponentFixture<CheckerInboxAndTasksComponent>;
  const rbacEnabled = environment.productionModeEnableRBAC;

  function createComponent(permissions: string[] = ['APPROVE_LOAN_CHECKER']) {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [
        CheckerInboxAndTasksComponent,
        TranslateModule.forRoot(),
        NoopAnimationsModule
      ],
      providers: [
        {
          provide: CheckerInboxCountService,
          useValue: {
            count: (): number | null => null,
            scope: () => 'test',
            update: jest.fn(),
            begin: jest.fn(() => 1)
          }
        },
        provideRouter([
          {
            path: 'checker-inbox-and-tasks',
            component: CheckerInboxAndTasksComponent
          }
        ]),
        { provide: AuthenticationService, useValue: { getCredentials: () => ({ permissions }) } }
      ]
    });

    fixture = TestBed.createComponent(CheckerInboxAndTasksComponent);
    fixture.detectChanges();
  }

  async function navigateToComponent(permissions: string[] = ['APPROVE_LOAN_CHECKER']) {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [
        CheckerInboxAndTasksComponent,
        TranslateModule.forRoot(),
        NoopAnimationsModule
      ],
      providers: [
        {
          provide: CheckerInboxCountService,
          useValue: {
            count: (): number | null => null,
            scope: () => 'test',
            update: jest.fn(),
            begin: jest.fn(() => 1)
          }
        },
        provideRouter([
          {
            path: 'checker-inbox-and-tasks',
            component: CheckerInboxAndTasksComponent
          }
        ]),
        { provide: AuthenticationService, useValue: { getCredentials: () => ({ permissions }) } }
      ]
    });

    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/checker-inbox-and-tasks', CheckerInboxAndTasksComponent);
    return harness.routeNativeElement as HTMLElement;
  }

  beforeEach(() => {
    environment.productionModeEnableRBAC = true;
  });

  afterEach(() => {
    environment.productionModeEnableRBAC = rbacEnabled;
  });

  it('shows the Credit tab for users who can read loans', () => {
    createComponent(['READ_LOAN']);

    const tabLabels = Array.from(fixture.nativeElement.querySelectorAll('nav a')).map((tab: HTMLElement) =>
      tab.textContent?.trim()
    );

    expect(tabLabels).toContain('labels.inputs.Credit Applications');
    expect(tabLabels).toContain('labels.inputs.Credit');
    expect(tabLabels).toContain('labels.heading.Mass Rejection');
  });

  it('hides Requests, Credit, and Mass Rejection for users who cannot read loans', () => {
    createComponent([]);

    const tabLabels = Array.from(fixture.nativeElement.querySelectorAll('nav a')).map((tab: HTMLElement) =>
      tab.textContent?.trim()
    );

    expect(tabLabels).not.toContain('labels.inputs.Credit Applications');
    expect(tabLabels).not.toContain('labels.inputs.Credit');
    expect(tabLabels).not.toContain('labels.heading.Mass Rejection');
  });

  it('groups review, approvals and operations without changing existing routes', () => {
    createComponent(['ALL_FUNCTIONS']);
    const groups = Array.from(fixture.nativeElement.querySelectorAll('.queue-group')) as HTMLElement[];
    expect(groups).toHaveLength(3);
    expect(groups[0].textContent).toContain('labels.inputs.Credit Applications');
    expect(groups[0].textContent).toContain('labels.inputs.Pending Prospects');
    expect(groups[1].textContent).toContain('labels.inputs.Loan Approval');
    expect(groups[2].textContent).toContain('labels.inputs.Credit');
    expect(fixture.nativeElement.querySelectorAll('.queue-count')).toHaveLength(0);
  });

  it('routes Requests to the existing credit applications page', async () => {
    const routeElement = await navigateToComponent(['READ_LOAN']);

    const requestsTab = Array.from(routeElement.querySelectorAll('nav a')).find((tab: HTMLElement) =>
      tab.textContent?.includes('labels.inputs.Credit Applications')
    ) as HTMLAnchorElement;

    expect(requestsTab.getAttribute('href')).toBe('/checker-inbox-and-tasks/requests');
  });

  it('routes Credit to the credit applications page', async () => {
    const routeElement = await navigateToComponent(['READ_LOAN']);

    const creditTab = Array.from(routeElement.querySelectorAll('nav a')).find(
      (tab: HTMLElement) => tab.textContent?.trim() === 'labels.inputs.Credit'
    ) as HTMLAnchorElement;

    expect(creditTab.getAttribute('href')).toBe('/checker-inbox-and-tasks/credit');
  });

  it('routes Mass Rejection to its dedicated task tab', async () => {
    const routeElement = await navigateToComponent(['READ_LOAN']);

    const massRejectionTab = Array.from(routeElement.querySelectorAll('nav a')).find((tab: HTMLElement) =>
      tab.textContent?.includes('labels.heading.Mass Rejection')
    ) as HTMLAnchorElement;

    expect(massRejectionTab.getAttribute('href')).toBe('/checker-inbox-and-tasks/mass-rejection');
  });

  it('shows Pending Prospects only for users who can read prospects', () => {
    createComponent(['READ_PROSPECT']);

    let tabLabels = Array.from(fixture.nativeElement.querySelectorAll('nav a')).map((tab: HTMLElement) =>
      tab.textContent?.trim()
    );
    expect(tabLabels).toContain('labels.inputs.Pending Prospects');

    createComponent([]);
    tabLabels = Array.from(fixture.nativeElement.querySelectorAll('nav a')).map((tab: HTMLElement) =>
      tab.textContent?.trim()
    );
    expect(tabLabels).not.toContain('labels.inputs.Pending Prospects');
  });

  it('routes Pending Prospects to the pending prospects page', async () => {
    const routeElement = await navigateToComponent(['READ_PROSPECT']);

    const pendingProspectsTab = Array.from(routeElement.querySelectorAll('nav a')).find((tab: HTMLElement) =>
      tab.textContent?.includes('labels.inputs.Pending Prospects')
    ) as HTMLAnchorElement;

    expect(pendingProspectsTab.getAttribute('href')).toBe('/checker-inbox-and-tasks/pending-prospects');
  });

  it('uses CreditApplicationsComponent for Requests, Credit, and Mass Rejection routes', () => {
    const shellRoute = routes[0] as AngularRoute;
    const taskRoute = shellRoute.children?.find((route: AngularRoute) => route.path === '');
    const requestsRoute = taskRoute?.children?.find((route: AngularRoute) => route.path === 'requests');
    const creditRoute = taskRoute?.children?.find((route: AngularRoute) => route.path === 'credit');
    const massRejectionRoute = taskRoute?.children?.find((route: AngularRoute) => route.path === 'mass-rejection');

    expect(requestsRoute?.component).toBe(CreditApplicationsComponent);
    expect(creditRoute?.component).toBe(CreditApplicationsComponent);
    expect(massRejectionRoute?.component).toBe(CreditApplicationsComponent);
    expect(requestsRoute?.data?.permissions).toEqual(['READ_LOAN']);
    expect(creditRoute?.data?.permissions).toEqual(['READ_LOAN']);
    expect(massRejectionRoute?.data?.permissions).toEqual(['READ_LOAN']);
    expect(requestsRoute?.canActivate).toHaveLength(1);
    expect(creditRoute?.canActivate).toHaveLength(1);
    expect(massRejectionRoute?.canActivate).toHaveLength(1);
    expect(requestsRoute?.canDeactivate).toHaveLength(1);
    expect(creditRoute?.canDeactivate).toHaveLength(1);
    expect(massRejectionRoute?.canDeactivate).toHaveLength(1);
  });

  it('uses PendingProspectsComponent for the pending prospects route', () => {
    const shellRoute = routes[0] as AngularRoute;
    const taskRoute = shellRoute.children?.find((route: AngularRoute) => route.path === '');
    const pendingProspectsRoute = taskRoute?.children?.find(
      (route: AngularRoute) => route.path === 'pending-prospects'
    );

    expect(pendingProspectsRoute?.component).toBe(PendingProspectsComponent);
    expect(pendingProspectsRoute?.data?.permissions).toEqual(['READ_PROSPECT']);
  });
  it('omits unavailable counts, renders genuine zero counts without disabling navigation', () => {
    createComponent(['READ_LOAN']);
    expect(fixture.nativeElement.querySelector('.queue-count')).toBeNull();
    let emit: (count: number | null) => void;
    fixture.componentInstance.onActivate({
      queueCountChange: {
        subscribe: (callback: (count: number | null) => void) => {
          emit = callback;
          return { unsubscribe: jest.fn() };
        }
      } as any
    });
    emit(0);
    fixture.detectChanges();
    const credit = fixture.nativeElement.querySelector('.empty-queue');
    expect(credit).not.toBeNull();
    expect(credit.textContent).toContain('0');
    expect(credit.getAttribute('disabled')).toBeNull();
  });

  it('preserves every existing deep-link path in the grouped navigation', async () => {
    const element = await navigateToComponent(['ALL_FUNCTIONS']);
    expect(Array.from(element.querySelectorAll('nav a')).map((link) => link.getAttribute('href'))).toEqual(
      [
        'checker-inbox',
        'requests',
        'pending-prospects',
        'client-approval',
        'loan-approval',
        'council-approval',
        'loan-disbursal',
        'reschedule-loan',
        'credit',
        'mass-rejection'
      ].map((path) => '/checker-inbox-and-tasks/' + path)
    );
  });
  it('clears the previous badge before a newly activated credit child emits', () => {
    createComponent(['READ_LOAN']);
    fixture.componentInstance.creditCount = 52;
    let emit: (count: number | null) => void;
    fixture.componentInstance.onActivate({
      queueCountChange: {
        subscribe: (callback: (count: number | null) => void) => {
          emit = callback;
          return { unsubscribe: jest.fn() };
        }
      } as any
    });
    fixture.detectChanges();
    expect(fixture.componentInstance.creditCount).toBeNull();
    expect(fixture.nativeElement.querySelector('.queue-count')).toBeNull();
    emit(0);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.queue-count').textContent.trim()).toBe('0');
  });
  it('routes verified rejection counts to the Mass Rejection badge independently from Credit', () => {
    createComponent(['READ_LOAN']);
    let emit!: (count: number | null) => void;
    fixture.componentInstance.onActivate({
      isMassRejection: true,
      queueCountChange: {
        subscribe: (callback: (count: number | null) => void) => {
          emit = callback;
          return { unsubscribe: jest.fn() };
        }
      } as any
    });
    emit(9);
    fixture.detectChanges();
    expect(fixture.componentInstance.massRejectionCount).toBe(9);
    expect(fixture.componentInstance.creditCount).toBeNull();
    expect(fixture.nativeElement.querySelector('.tasks-heading').textContent).toContain('massRejection.description');
    emit(null);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.queue-count')).toBeNull();
  });
});
