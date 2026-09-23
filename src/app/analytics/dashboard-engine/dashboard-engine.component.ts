/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/* eslint-disable @angular-eslint/prefer-inject */
/** Angular Imports */
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges
} from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Subscription, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';

import { TranslateService } from '@ngx-translate/core';
/** Custom Services */
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { AnalyticsDataSourceService } from '../services/analytics-data-source.service';
import { AnalyticsVisibilityService } from '../services/analytics-visibility.service';
import { DashboardExportService } from '../services/dashboard-export.service';
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
import { ThrIconComponent } from 'app/shared/thr-icon/thr-icon.component';

@Component({
  selector: 'mifosx-analytics-dashboard',
  standalone: true,
  templateUrl: './dashboard-engine.component.html',
  styleUrls: ['./dashboard-engine.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatMenuModule,
    MatIconButton,
    MatTooltip,
    DashboardWidgetComponent,
    ThrIconComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardEngineComponent implements OnInit, OnChanges, OnDestroy {
  @Input({ required: true }) dashboard!: AnalyticsDashboardDefinition;
  @Input() offices: any[] = [];
  @Input() products: any[] = [];
  @Input() clientGroups: any[] = [];

  filtersForm!: UntypedFormGroup;
  visibleWidgets: AnalyticsWidgetDefinition[] = [];
  widgetStateMap: Record<string, AnalyticsWidgetState> = {};

  private filtersSubscription?: Subscription;
  private loadSubscription?: Subscription;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private authenticationService: AuthenticationService,
    private analyticsDataSourceService: AnalyticsDataSourceService,
    private analyticsVisibilityService: AnalyticsVisibilityService,
    private dashboardExportService: DashboardExportService,
    private translateService: TranslateService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  get metricWidgets(): AnalyticsWidgetDefinition[] {
    return this.visibleWidgets.filter((widget) => widget.type === 'metric');
  }

  get chartWidgets(): AnalyticsWidgetDefinition[] {
    return this.visibleWidgets.filter((widget) => widget.type === 'chart');
  }

  get heroMetrics(): AnalyticsWidgetDefinition[] {
    return this.metricWidgets.slice(0, 4);
  }

  get sideMetrics(): AnalyticsWidgetDefinition[] {
    return this.metricWidgets.slice(4);
  }

  get featuredChart(): AnalyticsWidgetDefinition | undefined {
    return this.chartWidgets.find((widget) => widget.adapter !== 'georeference-map');
  }

  get activityGroups(): {
    categoryKey: string;
    rows: { id: string; segmentKey: string; value: string; icon: string; share: number }[];
  }[] {
    const grouped = new Map<
      string,
      { id: string; segmentKey: string; value: string; icon: string; amount: number }[]
    >();

    this.visibleWidgets.forEach((widget) => {
      const details = this.widgetStateMap[widget.id]?.details;
      if (!details?.length) {
        return;
      }
      const rows = grouped.get(widget.titleKey) || [];
      details.forEach((detail, index) => {
        rows.push({
          id: `${widget.id}-${index}`,
          segmentKey: detail.labelKey,
          value: this.formatMetricValue(widget, detail.value),
          icon: widget.icon || 'chart-line',
          amount: Math.abs(detail.value || 0)
        });
      });
      grouped.set(widget.titleKey, rows);
    });

    return [...grouped.entries()].map(
      ([
        categoryKey,
        rows
      ]) => {
        const max = Math.max(...rows.map((row) => row.amount), 0);
        return {
          categoryKey,
          rows: rows.map((row) => ({
            id: row.id,
            segmentKey: row.segmentKey,
            value: row.value,
            icon: row.icon,
            share: max > 0 ? Math.round((row.amount / max) * 100) : 0
          }))
        };
      }
    );
  }

  isInvertedHero(widget: AnalyticsWidgetDefinition): boolean {
    return this.heroMetrics.length === 4 && widget.id === this.heroMetrics[3].id;
  }

  heroCaption(widget: AnalyticsWidgetDefinition): string {
    if (!this.isInvertedHero(widget)) {
      return '';
    }

    const collectedWidget = this.visibleWidgets.find((item) => item.adapter === 'collection-total');
    const collected = this.widgetStateMap[collectedWidget?.id || '']?.metricValue;
    const pending = this.widgetStateMap[widget.id]?.metricValue;

    if (collected === undefined || collected === null) {
      return '';
    }

    return this.translateService.instant('labels.text.You collected {{collected}} / {{total}}', {
      collected: this.formatMetricValue(collectedWidget || widget, collected),
      total: this.formatMetricValue(widget, collected + (pending || 0))
    });
  }

  private formatMetricValue(widget: AnalyticsWidgetDefinition, value?: number): string {
    if (value === undefined || value === null) {
      return '—';
    }

    const currencyAdapters = new Set([
      'collection-total',
      'disbursement-total',
      'savings-total',
      'average-loan-size-total'
    ]);

    if (currencyAdapters.has(widget.adapter)) {
      const abs = Math.abs(value);
      const sign = value < 0 ? '-' : '';
      if (abs >= 1_000_000) {
        return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
      }
      if (abs >= 1_000) {
        return `${sign}$${(abs / 1_000).toFixed(1)}K`;
      }
      return `${sign}$${abs.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    }

    return value.toLocaleString('en-US', { maximumFractionDigits: 0 });
  }

  ngOnInit(): void {
    this.updateVisibleWidgets();

    this.filtersForm = this.formBuilder.group({
      officeId: [this.resolveDefaultOfficeId()],
      timescale: ['Month'],
      productId: [''],
      clientGroupId: ['']
    });

    this.filtersSubscription = this.filtersForm.valueChanges.subscribe(() => {
      this.reloadDashboard();
      // Immediately mark for check so Branch dropdown and pin active state update before async reload
      this.changeDetectorRef.markForCheck();
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

  exportAsCSV(): void {
    const widgetsData = this.visibleWidgets.map((widget) => ({
      id: widget.id,
      title: this.translateService.instant(widget.titleKey),
      state: this.widgetStateMap[widget.id]
    }));
    this.dashboardExportService.exportAsCSV(widgetsData, 'mifos-dashboard');
  }

  exportAsPDF(): void {
    const widgetsData = this.visibleWidgets.map((widget) => ({
      id: widget.id,
      title: this.translateService.instant(widget.titleKey),
      state: this.widgetStateMap[widget.id]
    }));
    this.dashboardExportService.exportAsPDF(widgetsData, 'mifos-dashboard');
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
          })),
          catchError((error) => {
            console.error(`Dashboard widget failed to load - Adapter: ${widget.adapter}, ID: ${widget.id}`, error);
            return of({
              widgetId: widget.id,
              state: {
                loading: false,
                empty: true
              }
            });
          })
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
        this.changeDetectorRef.detectChanges();
      },
      error: (error) => {
        console.error('Dashboard forkJoin error:', error);
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
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  onOfficeSelected(officeId: number): void {
    // Patch the form — this triggers valueChanges → reloadDashboard() + markForCheck()
    this.filtersForm.patchValue({ officeId });
    // Force immediate view update so pin turns orange and dropdown reflects new value
    this.changeDetectorRef.detectChanges();
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
