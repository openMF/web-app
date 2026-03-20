/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports nice thingy */
import {
  AfterViewInit,
  Component,
  DestroyRef,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
  inject
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
/** Charting Imports */
import { Chart, registerables } from 'chart.js';

/** Translation Imports */
import { TranslateService } from '@ngx-translate/core';

/** Custom Services */
import { ThemingService } from 'app/shared/theme-toggle/theming.service';

/** Custom Imports */
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { AnalyticsWidgetDefinition, AnalyticsWidgetState } from '../models/analytics-dashboard.model';

Chart.register(...registerables);

@Component({
  selector: 'mifosx-dashboard-widget',
  standalone: true,
  templateUrl: './dashboard-widget.component.html',
  styleUrls: ['./dashboard-widget.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent
  ]
})
export class DashboardWidgetComponent implements AfterViewInit, OnChanges, OnDestroy {
  private themingService = inject(ThemingService);
  private translateService = inject(TranslateService);
  private destroyRef = inject(DestroyRef);

  @Input({ required: true }) widget!: AnalyticsWidgetDefinition;
  @Input() state?: AnalyticsWidgetState;

  @ViewChild('chartCanvas')
  set chartCanvasRef(value: ElementRef<HTMLCanvasElement> | undefined) {
    this.chartCanvas = value;
    if (value) {
      setTimeout(() => this.renderChart());
    }
  }

  private chartCanvas?: ElementRef<HTMLCanvasElement>;

  private chart?: any;
  private currentTheme = 'light-theme';

  constructor() {
    this.themingService.theme.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((theme) => {
      this.currentTheme = theme;
      this.renderChart();
    });

    this.translateService.onLangChange.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.renderChart();
    });
  }

  ngAfterViewInit(): void {
    this.renderChart();
  }

  /** not really clear */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['state'] || changes['widget']) {
      setTimeout(() => this.renderChart());
    }
  }

  ngOnDestroy(): void {
    this.destroyChart();
  }

  private renderChart(): void {
    if (this.widget?.type !== 'chart') {
      this.destroyChart();
      return;
    }

    if (!this.chartCanvas || !this.state || this.state.loading || this.state.empty || !this.state.datasets?.length) {
      this.destroyChart();
      return;
    }

    const canvas = this.chartCanvas.nativeElement;
    const legendColor = this.currentTheme === 'dark-theme' ? '#f5f5f5' : '#4f4f4f';
    const axisColor = this.currentTheme === 'dark-theme' ? '#d9d9d9' : '#757575';

    const labels = (this.state.labels || []).map((label) =>
      this.state.translateLabels ? this.translateService.instant(label) : label
    );

    const datasets: any[] = this.state.datasets.map((dataset) => ({
      ...dataset,
      label: this.translateService.instant(dataset.labelKey),
      borderRadius: this.widget.chartType === 'bar' ? 8 : 0
    }));

    const config: any = {
      type: this.widget.chartType || 'bar',
      data: {
        labels,
        datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 400
        },
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: legendColor
            }
          }
        },
        scales:
          this.widget.chartType === 'bar'
            ? {
                x: {
                  ticks: {
                    color: axisColor
                  },
                  grid: {
                    display: false
                  }
                },
                y: {
                  beginAtZero: true,
                  ticks: {
                    color: axisColor
                  }
                }
              }
            : undefined
      }
    };

    this.destroyChart();
    this.chart = new Chart(canvas, config);
  }
  private destroyChart(): void {
    if (this.chart) {
      this.chart.destroy();
      this.chart = undefined;
    }
  }
}
