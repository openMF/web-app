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
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject, of } from 'rxjs';

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
  const queryParamMap$ = new BehaviorSubject(convertToParamMap({}));

  beforeEach(async () => {
    queryParamMap$.next(convertToParamMap({}));
    await TestBed.configureTestingModule({
      imports: [
        DashboardComponent,
        RouterTestingModule,
        TranslateModule.forRoot()
      ],
      providers: [
        provideNoopAnimations(),
        {
          provide: ActivatedRoute,
          useValue: {
            data: of({ offices: [], products: [], clientGroups: [] }),
            queryParamMap: queryParamMap$
          }
        },
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

  it('shows the analytics dashboard by default without page tabs', () => {
    expect(fixture.nativeElement.querySelectorAll('[role="tab"]').length).toBe(0);
    expect(fixture.nativeElement.querySelector('mifosx-analytics-dashboard')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('mifosx-onboarding-board')).toBeNull();
  });

  it('shows the Onboarding Board from the dashboard query param even without onboarding permissions', () => {
    environment.productionModeEnableRBAC = true;
    queryParamMap$.next(convertToParamMap({ view: 'onboarding' }));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('mifosx-onboarding-board')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('mifosx-analytics-dashboard')).toBeNull();
  });

  it('restores the existing dashboard content when leaving onboarding', () => {
    queryParamMap$.next(convertToParamMap({ view: 'onboarding' }));
    fixture.detectChanges();
    queryParamMap$.next(convertToParamMap({}));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('mifosx-analytics-dashboard')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('mifosx-onboarding-board')).toBeNull();
  });
});
