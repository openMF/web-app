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

    const tabLabels = Array.from(fixture.nativeElement.querySelectorAll('a[mat-tab-link]')).map((tab: HTMLElement) =>
      tab.textContent?.trim()
    );

    expect(tabLabels).toContain('labels.inputs.Requests');
    expect(tabLabels).toContain('labels.inputs.Credit');
  });

  it('keeps Requests visible and hides Credit for users who cannot read loans', () => {
    createComponent([]);

    const tabLabels = Array.from(fixture.nativeElement.querySelectorAll('a[mat-tab-link]')).map((tab: HTMLElement) =>
      tab.textContent?.trim()
    );

    expect(tabLabels).toContain('labels.inputs.Requests');
    expect(tabLabels).not.toContain('labels.inputs.Credit');
  });

  it('places Requests and Credit after Reschedule Loan', () => {
    createComponent(['ALL_FUNCTIONS']);

    const tabLabels = Array.from(fixture.nativeElement.querySelectorAll('a[mat-tab-link]')).map((tab: HTMLElement) =>
      tab.textContent?.trim()
    );
    const rescheduleLoanIndex = tabLabels.indexOf('labels.inputs.Reschedule Loan');
    const requestsIndex = tabLabels.indexOf('labels.inputs.Requests');
    const creditIndex = tabLabels.indexOf('labels.inputs.Credit');

    expect(requestsIndex).toBe(rescheduleLoanIndex + 1);
    expect(creditIndex).toBe(requestsIndex + 1);
  });

  it('routes Requests to the existing credit applications page', async () => {
    const routeElement = await navigateToComponent();

    const requestsTab = Array.from(routeElement.querySelectorAll('a[mat-tab-link]')).find((tab: HTMLElement) =>
      tab.textContent?.includes('labels.inputs.Requests')
    ) as HTMLAnchorElement;

    expect(requestsTab.getAttribute('href')).toBe('/checker-inbox-and-tasks/requests');
  });

  it('routes Credit to the credit applications page', async () => {
    const routeElement = await navigateToComponent(['READ_LOAN']);

    const creditTab = Array.from(routeElement.querySelectorAll('a[mat-tab-link]')).find((tab: HTMLElement) =>
      tab.textContent?.includes('labels.inputs.Credit')
    ) as HTMLAnchorElement;

    expect(creditTab.getAttribute('href')).toBe('/checker-inbox-and-tasks/credit');
  });

  it('shows Pending Prospects only for users who can read prospects', () => {
    createComponent(['READ_PROSPECT']);

    let tabLabels = Array.from(fixture.nativeElement.querySelectorAll('a[mat-tab-link]')).map((tab: HTMLElement) =>
      tab.textContent?.trim()
    );
    expect(tabLabels).toContain('labels.inputs.Pending Prospects');

    createComponent([]);
    tabLabels = Array.from(fixture.nativeElement.querySelectorAll('a[mat-tab-link]')).map((tab: HTMLElement) =>
      tab.textContent?.trim()
    );
    expect(tabLabels).not.toContain('labels.inputs.Pending Prospects');
  });

  it('routes Pending Prospects to the pending prospects page', async () => {
    const routeElement = await navigateToComponent(['READ_PROSPECT']);

    const pendingProspectsTab = Array.from(routeElement.querySelectorAll('a[mat-tab-link]')).find((tab: HTMLElement) =>
      tab.textContent?.includes('labels.inputs.Pending Prospects')
    ) as HTMLAnchorElement;

    expect(pendingProspectsTab.getAttribute('href')).toBe('/checker-inbox-and-tasks/pending-prospects');
  });

  it('uses CreditApplicationsComponent for both Requests and Credit routes', () => {
    const shellRoute = routes[0] as AngularRoute;
    const taskRoute = shellRoute.children?.find((route: AngularRoute) => route.path === '');
    const requestsRoute = taskRoute?.children?.find((route: AngularRoute) => route.path === 'requests');
    const creditRoute = taskRoute?.children?.find((route: AngularRoute) => route.path === 'credit');

    expect(requestsRoute?.component).toBe(CreditApplicationsComponent);
    expect(creditRoute?.component).toBe(CreditApplicationsComponent);
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
});
