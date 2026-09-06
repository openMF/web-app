/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, Component, OnInit, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { activities } from '../activities';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { DashboardEngineComponent } from 'app/analytics/dashboard-engine/dashboard-engine.component';
import { GLOBAL_ANALYTICS_DASHBOARD } from 'app/analytics/global-dashboard.config';
import { MatTab, MatTabContent, MatTabGroup } from '@angular/material/tabs';
import { OnboardingBoardComponent } from './onboarding-board/onboarding-board.component';

/**
 * Dashboard component.
 */
@Component({
  selector: 'mifosx-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    DashboardEngineComponent,
    MatTab,
    MatTabContent,
    MatTabGroup,
    OnboardingBoardComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  /** Search Text. */
  searchText: FormControl = new FormControl();
  /** Filtered Activities. */
  filteredActivities!: Observable<any[]>;
  /** All User Activities. */
  allActivities: any[] = activities;
  /** Dashboard definition */
  dashboardDefinition = GLOBAL_ANALYTICS_DASHBOARD;
  /** Office options from resolver */
  offices: any[] = [];
  /** Product options */
  products: any[] = [];
  /** Client group options */
  clientGroups: any[] = [];

  constructor() {
    this.route.data.subscribe((data: { offices: any[]; products?: any[]; clientGroups?: any[] }) => {
      this.offices = data.offices || [];
      this.products = data.products || [];
      this.clientGroups = data.clientGroups || [];
    });
  }

  ngOnInit() {
    this.setFilteredActivities();
  }

  /**
   * Sets filtered activities for autocomplete.
   */
  setFilteredActivities() {
    this.filteredActivities = this.searchText.valueChanges.pipe(
      map((activity: any) => (typeof activity === 'string' ? activity : activity.activity)),
      map((activityName: string) => (activityName ? this.filterActivity(activityName) : this.allActivities))
    );
  }

  /**
   * Filters activities.
   * @param activityName Activity name to filter activity by.
   * @returns {any} Filtered activities.
   */
  private filterActivity(activityName: string): any {
    const filterValue = activityName.toLowerCase();
    return this.allActivities.filter((activity) => activity.activity.toLowerCase().indexOf(filterValue) === 0);
  }
}
