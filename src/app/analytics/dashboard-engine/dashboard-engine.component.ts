/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/* eslint-disable @angular-eslint/prefer-inject */
/** Angular Imports */
import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Subscription, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { MatButtonToggle, MatButtonToggleGroup } from '@angular/material/button-toggle';
/** Custom Services */
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { AnalyticsDataSourceService } from '../services/analytics-data-source.service';
import { AnalyticsVisibilityService } from '../services/analytics-visibility.service';
/** Custom Models */
import {
  AnalyticsDashboardDefinition,
  AnalyticsFilters,
  AnalyticsWidgetDefinition,
  AnalyticsWidgetState
} from '../models/analytics-dashboard.model';
/** Custom Imports */
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { DashboardWidgetComponent } from '../dashboard-widget/dashboard-widget.component';

@Component({
  selector: 'mifosx-analytics-dashboard',
  standalone: true,
  templateUrl: './dashboard-engine.component.html',
  styleUrls: ['./dashboard-engine.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatButtonToggleGroup,
    MatButtonToggle,
    DashboardWidgetComponent
  ]
})
export class DashboardEngineComponent implements OnInit, OnChanges, OnDestroy {
  @Input({ required: true }) dashboard!: AnalyticsDashboardDefinition;
  @Input() offices: any[] = [];

  filtersForm!: UntypedFormGroup;
  visibleWidgets: AnalyticsWidgetDefinition[] = [];
  widgetStateMap: Record<string, AnalyticsWidgetState> = {};

  private filtersSubscription?: Subscription;
  private loadSubscription?: Subscription;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private authenticationService: AuthenticationService,
    private analyticsDataSourceService: AnalyticsDataSourceService,
    private analyticsVisibilityService: AnalyticsVisibilityService
  ) {}
  get metricWidgets(): AnalyticsWidgetDefinition[] {
    return this.visibleWidgets.filter((widget) => widget.type === 'metric');
  }

  get chartWidgets(): AnalyticsWidgetDefinition[] {
    return this.visibleWidgets.filter((widget) => widget.type === 'chart');
  }

  ngOnInit(): void {
    this.updateVisibleWidgets();

    this.filtersForm = this.formBuilder.group({
      officeId: [this.resolveDefaultOfficeId()],
      timescale: ['Month']
    });

    this.filtersSubscription = this.filtersForm.valueChanges.subscribe(() => {
      this.reloadDashboard();
    });

    this.reloadDashboard();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dashboard']) {
      this.updateVisibleWidgets();
      if (this.filtersForm) {
        this.reloadDashboard();
      }
    }
    if (
      changes['offices'] &&
      this.filtersForm &&
      !this.offices.some((office) => office.id === this.filtersForm.value.officeId)
    ) {
      this.filtersForm.patchValue(
        {
          officeId: this.resolveDefaultOfficeId()
        },
        { emitEvent: false }
      );
      this.reloadDashboard();
    }
  }
  ngOnDestroy(): void {
    if (this.filtersSubscription) {
      this.filtersSubscription.unsubscribe();
    }

    if (this.loadSubscription) {
      this.loadSubscription.unsubscribe();
    }
  }

  reloadDashboard(forceRefresh: boolean = false): void {
    if (!this.visibleWidgets.length) {
      return;
    }

    if (forceRefresh) {
      this.analyticsDataSourceService.clearCache();
    }

    if (this.loadSubscription) {
      this.loadSubscription.unsubscribe();
    }

    const filters = this.filtersForm.getRawValue() as AnalyticsFilters;
    this.widgetStateMap = this.visibleWidgets.reduce(
      (accumulator, widget) => ({
        ...accumulator,
        [widget.id]: {
          loading: true,
          empty: false
        }
      }),
      {}
    );

    this.loadSubscription = forkJoin(
      this.visibleWidgets.map((widget) =>
        this.analyticsDataSourceService.loadWidget(widget, filters).pipe(
          map((state) => ({
            widgetId: widget.id,
            state
          }))
        )
      )
    ).subscribe({
      next: (results) => {
        this.widgetStateMap = results.reduce(
          (accumulator, result) => ({
            ...accumulator,
            [result.widgetId]: result.state
          }),
          {}
        );
      },
      error: () => {
        this.widgetStateMap = this.visibleWidgets.reduce(
          (accumulator, widget) => ({
            ...accumulator,
            [widget.id]: {
              loading: false,
              empty: true
            }
          }),
          {}
        );
      }
    });
  }

  private resolveDefaultOfficeId(): number | null {
    const credentials = this.authenticationService.getCredentials();
    const currentOfficeId = credentials?.officeId;

    if (currentOfficeId && this.offices.some((office) => office.id === currentOfficeId)) {
      return currentOfficeId;
    }

    return this.offices[0]?.id ?? null;
  }
  private updateVisibleWidgets(): void {
    this.visibleWidgets = (this.dashboard?.widgets || []).filter((widget) =>
      this.analyticsVisibilityService.canView(widget.visibleTo)
    );
  }
}
