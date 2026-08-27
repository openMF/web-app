/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports nice thingy */
import {
  ChangeDetectionStrategy,
  AfterViewInit,
  Component,
  DestroyRef,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
  inject,
  Output,
  EventEmitter,
  ChangeDetectorRef
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import * as L from 'leaflet';
import 'leaflet.markercluster';

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

/** Adapters that show currency values */
const CURRENCY_ADAPTERS = new Set([
  'collection-total',
  'disbursement-total',
  'savings-total',
  'average-loan-size-total'
]);

/** Adapters that show percentage values */
const PERCENT_ADAPTERS = new Set<string>([]);

@Component({
  selector: 'mifosx-dashboard-widget',
  standalone: true,
  templateUrl: './dashboard-widget.component.html',
  styleUrls: ['./dashboard-widget.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardWidgetComponent implements AfterViewInit, OnChanges, OnDestroy {
  private themingService = inject(ThemingService);
  private translateService = inject(TranslateService);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  @Input({ required: true }) widget!: AnalyticsWidgetDefinition;
  @Input() state?: AnalyticsWidgetState;
  @Input() offices: any[] = [];
  @Input() selectedOfficeId: number | null = null;
  @Output() officeSelected = new EventEmitter<number>();

  hasValidCoordinates = false;

  private map?: L.Map;
  private markerClusterGroup?: L.MarkerClusterGroup;
  private markersMap = new Map<number, L.Marker>();
  private leafletMapContainer?: ElementRef<HTMLDivElement>;

  @ViewChild('leafletMap')
  set leafletMapRef(elementRef: ElementRef<HTMLDivElement> | undefined) {
    if (elementRef) {
      this.leafletMapContainer = elementRef;
      // Initialize map dynamically when the container is rendered in the DOM
      setTimeout(() => this.initMap());
    } else {
      this.destroyMap();
      this.leafletMapContainer = undefined;
    }
  }

  getPinRadius(pin: any): number {
    const minVal = 100;
    const maxVal = 1000;
    const size = 6 + ((pin.clients - minVal) / (maxVal - minVal)) * 6;
    return Math.min(Math.max(size, 6), 12);
  }

  getCountryCode(country?: string): string {
    if (!country) {
      return '';
    }
    const codes: Record<string, string> = {
      Kenya: 'ke',
      Colombia: 'co',
      India: 'in',
      Panama: 'pa',
      Nigeria: 'ng',
      Uganda: 'ug',
      Philippines: 'ph',
      Angola: 'ao',
      Peru: 'pe',
      Tanzania: 'tz'
    };
    return codes[country] || '';
  }

  getFlagUrl(country?: string): string {
    const code = this.getCountryCode(country);
    if (!code) {
      return '';
    }
    return `https://flagcdn.com/20x15/${code}.png`;
  }

  selectOffice(officeId: number): void {
    this.selectedOfficeId = officeId;
    this.highlightActiveMarker();
    this.officeSelected.emit(officeId);
  }

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
      if (this.widget?.adapter === 'georeference-map') {
        this.updateMapMarkers();
      }
    });
  }

  ngAfterViewInit(): void {
    this.renderChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['state'] || changes['widget']) {
      setTimeout(() => this.renderChart());
      if (this.widget?.adapter === 'georeference-map') {
        setTimeout(() => this.updateMapMarkers());
      }
    }
    if (changes['selectedOfficeId'] && this.widget?.adapter === 'georeference-map') {
      setTimeout(() => this.highlightActiveMarker());
    }
  }

  ngOnDestroy(): void {
    this.destroyChart();
    this.destroyMap();
  }

  private initMap(): void {
    if (!this.leafletMapContainer) {
      return;
    }

    this.destroyMap();

    const element = this.leafletMapContainer.nativeElement;

    this.map = L.map(element, {
      zoomControl: true,
      minZoom: 1,
      maxZoom: 18,
      attributionControl: false
    }).setView(
      [
        0,
        0
      ],
      2
    );

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    this.markerClusterGroup = L.markerClusterGroup({
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      maxClusterRadius: 100,
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount();
        return L.divIcon({
          html: `<div class="cluster-inner"><span>${count}</span></div>`,
          className: 'custom-marker-cluster',
          iconSize: L.point(44, 44)
        });
      }
    });

    this.map.addLayer(this.markerClusterGroup);
    this.updateMapMarkers();
  }

  private updateMapMarkers(): void {
    const officesData = this.state?.mapData || [];

    // Filter valid markers
    const validOffices = officesData.filter((pin: any) => {
      const lat = Number(pin.latitude);
      const lng = Number(pin.longitude);
      return !isNaN(lat) && !isNaN(lng) && lat !== null && lng !== null && (lat !== 0 || lng !== 0);
    });

    const previousHasValid = this.hasValidCoordinates;
    this.hasValidCoordinates = validOffices.length > 0;

    if (this.hasValidCoordinates !== previousHasValid) {
      this.cdr.markForCheck();
    }

    if (!this.map || !this.markerClusterGroup) {
      return;
    }

    this.markerClusterGroup.clearLayers();
    this.markersMap.clear();

    const validMarkers: L.Marker[] = [];

    validOffices.forEach((pin: any) => {
      const lat = Number(pin.latitude);
      const lng = Number(pin.longitude);
      const isActive = pin.officeId === this.selectedOfficeId;
      const flagUrl = this.getFlagUrl(pin.country);

      // Custom SVG icon matching enterprise dashboard design
      const markerColor = isActive ? '#ea580c' : '#0284c7';
      const customIcon = L.divIcon({
        className: `custom-map-pin ${isActive ? 'active' : ''}`,
        html: `
          <div class="pin-pulse"></div>
          <svg class="pin-svg" width="28" height="38" viewBox="0 0 28 38" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 0C6.27 0 0 6.27 0 14C0 24.5 14 38 14 38C14 38 28 24.5 28 14C28 6.27 21.73 0 14 0Z" fill="${markerColor}" stroke="#ffffff" stroke-width="2"/>
            <circle cx="14" cy="14" r="5" fill="#ffffff"/>
          </svg>
        `,
        iconSize: L.point(28, 38),
        iconAnchor: L.point(14, 38),
        popupAnchor: L.point(0, -38)
      });

      const countryLabel = this.translateService.instant('labels.text.Country') || 'Country';
      const activeClientsLabel = this.translateService.instant('labels.text.Active Clients') || 'Active Clients';
      const activeLoansLabel = this.translateService.instant('labels.text.Active Loans') || 'Active Loans';
      const savingsPortfolioLabel =
        this.translateService.instant('labels.text.Savings Portfolio') || 'Savings Portfolio';
      const amountCollectedLabel = this.translateService.instant('labels.text.Amount Collected') || 'Amount Collected';

      const clientsVal = pin.clients ? pin.clients.toLocaleString('en-US') : '0';
      const loansVal = pin.loans ? pin.loans.toLocaleString('en-US') : '0';
      const savingsVal = pin.savings ? pin.savings.toLocaleString('en-US') : '0';
      const collectedVal = pin.collected ? pin.collected.toLocaleString('en-US') : '0';

      const safeOfficeName = this.escapeHtml(pin.officeName);
      const safeCountry = this.escapeHtml(pin.country);

      const popupHtml = `
        <div class="map-tooltip">
          <div class="tooltip-header">
            <i class="fa fa-globe tooltip-icon"></i>
            <div class="tooltip-title-container">
              <span class="tooltip-title">${safeOfficeName}</span>
              <span class="tooltip-subtitle">
                ${flagUrl ? `<img src="${flagUrl}" class="tooltip-flag" width="16" height="12" />` : ''}
                ${safeCountry}
              </span>
            </div>
          </div>
          <div class="tooltip-divider"></div>
          <div class="tooltip-row">
            <span class="tooltip-label">${countryLabel}:</span>
            <span class="tooltip-value">${safeCountry}</span>
          </div>
          <div class="tooltip-row">
            <span class="tooltip-label">${activeClientsLabel}:</span>
            <span class="tooltip-value">${clientsVal}</span>
          </div>
          <div class="tooltip-row">
            <span class="tooltip-label">${activeLoansLabel}:</span>
            <span class="tooltip-value">${loansVal}</span>
          </div>
          <div class="tooltip-row">
            <span class="tooltip-label">${savingsPortfolioLabel}:</span>
            <span class="tooltip-value">$${savingsVal}</span>
          </div>
          <div class="tooltip-row">
            <span class="tooltip-label">${amountCollectedLabel}:</span>
            <span class="tooltip-value">$${collectedVal}</span>
          </div>
        </div>
      `;

      const marker = L.marker(
        [
          lat,
          lng
        ],
        { icon: customIcon }
      );

      marker.bindPopup(popupHtml, {
        className: 'leaflet-custom-popup',
        closeButton: false,
        minWidth: 220
      });

      // Bind full statistics card to tooltip so hovering any pin displays full information card
      marker.bindTooltip(popupHtml, {
        permanent: false,
        direction: 'top',
        className: 'leaflet-custom-popup custom-tooltip-card',
        offset: L.point(0, -38)
      });

      // Close tooltip when popup opens to avoid duplication
      marker.on('popupopen', () => {
        marker.closeTooltip();
      });

      marker.on('click', (e: L.LeafletMouseEvent) => {
        if (e && e.originalEvent) {
          L.DomEvent.stopPropagation(e.originalEvent);
        }
        marker.openPopup();
        this.selectOffice(pin.officeId);
      });

      this.markerClusterGroup!.addLayer(marker);
      this.markersMap.set(pin.officeId, marker);
      validMarkers.push(marker);
    });

    // Fit map bounds automatically based on coordinates
    if (validMarkers.length === 1) {
      const markerLatLng = validMarkers[0].getLatLng();
      this.map.setView(markerLatLng, 10);
    } else if (validMarkers.length > 1) {
      const group = L.featureGroup(validMarkers);
      this.map.fitBounds(group.getBounds(), {
        padding: [
          50,
          50
        ],
        maxZoom: 16
      });
    }

    if (this.selectedOfficeId !== null) {
      this.highlightActiveMarker();
    }
  }

  private highlightActiveMarker(): void {
    this.markersMap.forEach((marker, officeId) => {
      const isActive = officeId === this.selectedOfficeId;
      const element = marker.getElement();
      if (element) {
        if (isActive) {
          element.classList.add('active');
        } else {
          element.classList.remove('active');
        }
      }
    });

    if (this.selectedOfficeId !== null && this.markersMap.has(this.selectedOfficeId) && this.map) {
      const targetOfficeId = this.selectedOfficeId;
      const marker = this.markersMap.get(targetOfficeId);
      if (marker) {
        const showMarkerPopup = () => {
          if (this.selectedOfficeId !== targetOfficeId || !this.map || !marker) {
            return;
          }
          marker.openPopup();
          this.map.panTo(marker.getLatLng());
        };

        if (this.markerClusterGroup) {
          this.markerClusterGroup.zoomToShowLayer(marker, showMarkerPopup);
        } else {
          setTimeout(showMarkerPopup, 50);
        }
      }
    }
  }

  private destroyMap(): void {
    if (this.map) {
      this.map.off();
      this.map.remove();
      this.map = undefined;
    }
    this.markerClusterGroup = undefined;
    this.markersMap.clear();
  }

  /**
   * Formats a metric value based on the widget adapter type.
   * - Currency adapters: format as $1.2K / $1.2M
   * - Percent adapters: format as 12.3%
   * - Default: plain integer
   */
  private escapeHtml(text?: string | null): string {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  formatMetricValue(widgetId: string, value?: number): string {
    if (value === undefined || value === null) {
      return '—';
    }

    const adapter = this.widget?.adapter;

    if (PERCENT_ADAPTERS.has(adapter)) {
      return `${value.toFixed(2)}%`;
    }

    if (CURRENCY_ADAPTERS.has(adapter)) {
      return this.formatCurrency(value);
    }

    // Plain integer (clients, loans, etc.)
    return value.toLocaleString('en-US', { maximumFractionDigits: 0 });
  }

  /** Trend direction derived from trendPositive flag on state */
  get trendDirection(): 'up' | 'down' | 'flat' | null {
    if (this.state?.trendPercent === undefined) {
      return null;
    }
    if (this.state.trendPositive === true) {
      return 'up';
    }
    if (this.state.trendPositive === false) {
      return 'down';
    }
    return 'flat';
  }

  private formatCurrency(value: number): string {
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
      this.state!.translateLabels ? this.translateService.instant(label) : label
    );

    const isLine = this.widget.chartType === 'line';

    const datasets: any[] = this.state.datasets.map((dataset) => ({
      ...dataset,
      label: this.translateService.instant(dataset.labelKey),
      borderRadius: this.widget.chartType === 'bar' ? 4 : 0,
      fill: dataset.fill ?? false,
      tension: dataset.tension ?? 0,
      pointRadius: isLine ? 4 : 0,
      pointHoverRadius: isLine ? 6 : 0
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
        cutout: this.widget.chartType === 'doughnut' ? '75%' : undefined,
        animation: {
          duration: 400
        },
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: legendColor,
              padding: 16,
              boxWidth: 12,
              boxHeight: 12
            }
          }
        },
        scales:
          this.widget.chartType !== 'doughnut'
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
                  },
                  grid: {
                    color: this.currentTheme === 'dark-theme' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'
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
