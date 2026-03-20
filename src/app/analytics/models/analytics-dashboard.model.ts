/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** refresh options as well */
export type AnalyticsTimescale = 'Day' | 'Week' | 'Month';

export interface AnalyticsFilters {
  officeId?: number | null;
  timescale: AnalyticsTimescale;
}
export interface AnalyticsVisibilityRule {
  permissionsAny?: string[];
  permissionsAll?: string[];
  roles?: string[];
}
export type AnalyticsWidgetLayout = 'metric' | 'wide' | 'half';
export type AnalyticsWidgetType = 'metric' | 'chart';
export type AnalyticsChartType = 'bar' | 'doughnut';
export type AnalyticsWidgetAdapter =
  | 'client-total'
  | 'loan-total'
  | 'collection-total'
  | 'disbursement-total'
  | 'client-loan-trends'
  | 'collection-breakdown'
  | 'disbursement-breakdown';
export interface AnalyticsWidgetDefinition {
  id: string;
  titleKey: string;
  type: AnalyticsWidgetType;
  layout: AnalyticsWidgetLayout;
  adapter: AnalyticsWidgetAdapter;
  icon: string;
  chartType?: AnalyticsChartType;
  visibleTo?: AnalyticsVisibilityRule;
}

export interface AnalyticsDashboardDefinition {
  id: string;
  titleKey: string;
  widgets: AnalyticsWidgetDefinition[];
}

export interface AnalyticsChartDataset {
  labelKey: string;
  data: number[];
  backgroundColor: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
}

export interface AnalyticsDetailItem {
  labelKey: string;
  value: number;
}

export interface AnalyticsWidgetState {
  loading: boolean;
  empty: boolean;
  metricValue?: number;
  contextKey?: string;
  labels?: string[];
  translateLabels?: boolean;
  datasets?: AnalyticsChartDataset[];
  details?: AnalyticsDetailItem[];
}
