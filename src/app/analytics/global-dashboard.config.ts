/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { AnalyticsDashboardDefinition } from './models/analytics-dashboard.model';

export const GLOBAL_ANALYTICS_DASHBOARD: AnalyticsDashboardDefinition = {
  id: 'global-dashboard',
  titleKey: 'labels.menus.Dashboard',
  widgets: [
    {
      id: 'clients-total',
      titleKey: 'labels.inputs.Clients',
      type: 'metric',
      layout: 'metric',
      adapter: 'client-total',
      icon: 'users',
      visibleTo: {
        permissionsAny: [
          'READ_REPORT',
          'READ_CLIENT',
          'ALL_FUNCTIONS'
        ]
      }
    },
    {
      id: 'loans-total',
      titleKey: 'labels.menus.Loans',
      type: 'metric',
      layout: 'metric',
      adapter: 'loan-total',
      icon: 'chart-line',
      visibleTo: {
        permissionsAny: [
          'READ_REPORT',
          'READ_LOAN',
          'ALL_FUNCTIONS'
        ]
      }
    },
    {
      id: 'collection-total',
      titleKey: 'labels.inputs.Amount Collected',
      type: 'metric',
      layout: 'metric',
      adapter: 'collection-total',
      icon: 'money-bill',
      visibleTo: {
        permissionsAny: [
          'READ_REPORT',
          'ALL_FUNCTIONS'
        ]
      }
    },
    {
      id: 'disbursement-total',
      titleKey: 'labels.inputs.Amount Pending / Disbursed',
      type: 'metric',
      layout: 'metric',
      adapter: 'disbursement-total',
      icon: 'money-bill',
      visibleTo: {
        permissionsAny: [
          'READ_REPORT',
          'ALL_FUNCTIONS'
        ]
      }
    },
    {
      id: 'client-loan-trends',
      titleKey: 'labels.inputs.Client Trends',
      type: 'chart',
      layout: 'wide',
      adapter: 'client-loan-trends',
      chartType: 'bar',
      icon: 'chart-line',
      visibleTo: {
        permissionsAny: [
          'READ_REPORT',
          'ALL_FUNCTIONS'
        ]
      }
    },
    {
      id: 'collection-breakdown',
      titleKey: 'labels.inputs.Amount Collected',
      type: 'chart',
      layout: 'half',
      adapter: 'collection-breakdown',
      chartType: 'doughnut',
      icon: 'money-bill',
      visibleTo: {
        permissionsAny: [
          'READ_REPORT',
          'ALL_FUNCTIONS'
        ]
      }
    },
    {
      id: 'disbursement-breakdown',
      titleKey: 'labels.inputs.Amount Pending / Disbursed',
      type: 'chart',
      layout: 'half',
      adapter: 'disbursement-breakdown',
      chartType: 'doughnut',
      icon: 'money-bill',
      visibleTo: {
        permissionsAny: [
          'READ_REPORT',
          'ALL_FUNCTIONS'
        ]
      }
    }
  ]
};
