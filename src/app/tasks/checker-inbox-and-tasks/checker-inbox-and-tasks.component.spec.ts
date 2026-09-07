/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';

import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { environment } from 'environments/environment';
import { CheckerInboxAndTasksComponent } from './checker-inbox-and-tasks.component';

describe('CheckerInboxAndTasksComponent', () => {
  let fixture: ComponentFixture<CheckerInboxAndTasksComponent>;
  const rbacEnabled = environment.productionModeEnableRBAC;

  function createComponent(permissions: string[] = ['APPROVE_LOAN_CHECKER']) {
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

  it('shows the Requests tab without a tab-level permission gate', () => {
    createComponent([]);

    const tabLabels = Array.from(fixture.nativeElement.querySelectorAll('a[mat-tab-link]')).map((tab: HTMLElement) =>
      tab.textContent?.trim()
    );

    expect(tabLabels).toContain('labels.inputs.Requests');
  });

  it('places the Requests tab after Reschedule Loan', () => {
    createComponent(['ALL_FUNCTIONS']);

    const tabLabels = Array.from(fixture.nativeElement.querySelectorAll('a[mat-tab-link]')).map((tab: HTMLElement) =>
      tab.textContent?.trim()
    );
    const rescheduleLoanIndex = tabLabels.indexOf('labels.inputs.Reschedule Loan');
    const requestsIndex = tabLabels.indexOf('labels.inputs.Requests');

    expect(requestsIndex).toBe(rescheduleLoanIndex + 1);
  });

  it('routes Requests to the credit applications page', async () => {
    const routeElement = await navigateToComponent();

    const requestsTab = Array.from(routeElement.querySelectorAll('a[mat-tab-link]')).find((tab: HTMLElement) =>
      tab.textContent?.includes('labels.inputs.Requests')
    ) as HTMLAnchorElement;

    expect(requestsTab.getAttribute('href')).toBe('/checker-inbox-and-tasks/requests');
  });
});
