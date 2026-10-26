/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';

import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { TasksService } from 'app/tasks/tasks.service';
import { DashboardComponent } from './dashboard.component';
import { DashboardEngineComponent } from 'app/analytics/dashboard-engine/dashboard-engine.component';
import { environment } from 'environments/environment';

@Component({
  selector: 'mifosx-analytics-dashboard',
  standalone: true,
  template: ''
})
class DashboardEngineStubComponent {
  @Input() dashboard: any;
  @Input() offices: any[];
  @Input() products: any[];
  @Input() clientGroups: any[];
}

describe('DashboardComponent', () => {
  let fixture: ComponentFixture<DashboardComponent>;
  const rbacEnabled = environment.productionModeEnableRBAC;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        DashboardComponent,
        RouterTestingModule,
        TranslateModule.forRoot()
      ],
      providers: [
        provideNoopAnimations(),
        { provide: ActivatedRoute, useValue: { data: of({ offices: [], products: [], clientGroups: [] }) } },
        {
          provide: AuthenticationService,
          useValue: { getCredentials: () => ({ permissions: [] as string[] }) }
        },
        {
          provide: TasksService,
          useValue: {
            getGroupedClientsData: () => of({ pageItems: [] }),
            getAllLoansToBeApproved: () => of({ pageItems: [] }),
            getAllSavingsToBeApproved: () => of({ pageItems: [] })
          }
        }
      ]
    })
      .overrideComponent(DashboardComponent, {
        remove: { imports: [DashboardEngineComponent] },
        add: { imports: [DashboardEngineStubComponent] }
      })
      .compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    environment.productionModeEnableRBAC = rbacEnabled;
  });

  it('shows both tabs even when the user has no onboarding read permissions', () => {
    environment.productionModeEnableRBAC = true;
    const tabLabels = Array.from(fixture.nativeElement.querySelectorAll('[role="tab"]')).map((tab: HTMLElement) =>
      tab.textContent?.trim()
    );

    expect(tabLabels).toEqual([
      'labels.heading.Dashboard',
      'labels.heading.Onboarding Board'
    ]);
  });

  it('selects Dashboard by default and lazily shows the Onboarding Board when selected', () => {
    const tabs = fixture.nativeElement.querySelectorAll('[role="tab"]');

    expect(tabs[0].getAttribute('aria-selected')).toBe('true');
    expect(fixture.nativeElement.querySelector('mifosx-analytics-dashboard')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('mifosx-onboarding-board')).toBeNull();

    tabs[1].click();
    fixture.detectChanges();

    expect(tabs[1].getAttribute('aria-selected')).toBe('true');
    expect(fixture.nativeElement.querySelector('mifosx-onboarding-board')).toBeTruthy();
  });

  it('restores the existing dashboard content when switching back', () => {
    const tabs = fixture.nativeElement.querySelectorAll('[role="tab"]');
    tabs[1].click();
    fixture.detectChanges();
    tabs[0].click();
    fixture.detectChanges();

    expect(tabs[0].getAttribute('aria-selected')).toBe('true');
    expect(fixture.nativeElement.querySelector('mifosx-analytics-dashboard')).toBeTruthy();
  });
});
