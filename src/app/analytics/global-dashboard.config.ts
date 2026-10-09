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
      id: 'savings-total',
      titleKey: 'labels.menus.Savings',
      type: 'metric',
      layout: 'metric',
      adapter: 'savings-total',
      icon: 'piggy-bank',
      visibleTo: {
        permissionsAny: [
          'READ_REPORT',
          'ALL_FUNCTIONS'
        ]
      }
    },
    {
      id: 'women-borrowers-total',
      titleKey: 'labels.text.Women Borrowers',
      type: 'metric',
      layout: 'metric',
      adapter: 'women-borrowers-total',
      icon: 'users',
      visibleTo: {
        permissionsAny: [
          'READ_REPORT',
          'ALL_FUNCTIONS'
        ]
      }
    },
    {
      id: 'rural-clients-total',
      titleKey: 'labels.text.Rural Clients',
      type: 'metric',
      layout: 'metric',
      adapter: 'rural-clients-total',
      icon: 'globe',
      visibleTo: {
        permissionsAny: [
          'READ_REPORT',
          'ALL_FUNCTIONS'
        ]
      }
    },
    {
      id: 'youth-clients-total',
      titleKey: 'labels.text.Youth Clients',
      type: 'metric',
      layout: 'metric',
      adapter: 'youth-clients-total',
      icon: 'user',
      visibleTo: {
        permissionsAny: [
          'READ_REPORT',
          'ALL_FUNCTIONS'
        ]
      }
    },
    {
      id: 'average-loan-size-total',
      titleKey: 'labels.text.Average Loan Size',
      type: 'metric',
      layout: 'metric',
      adapter: 'average-loan-size-total',
      icon: 'file-alt',
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
      id: 'portfolio-growth-by-group',
      titleKey: 'labels.text.Portfolio Growth by Client Group',
      type: 'chart',
      layout: 'two-thirds',
      adapter: 'portfolio-growth-by-group',
      chartType: 'line',
      icon: 'chart-line',
      visibleTo: {
        permissionsAny: [
          'READ_REPORT',
          'ALL_FUNCTIONS'
        ]
      }
    },
    {
      id: 'loan-portfolio-distribution',
      titleKey: 'labels.text.Loan Portfolio Distribution',
      type: 'chart',
      layout: 'one-third',
      adapter: 'loan-portfolio-distribution',
      chartType: 'doughnut',
      icon: 'chart-pie',
      visibleTo: {
        permissionsAny: [
          'READ_REPORT',
          'ALL_FUNCTIONS'
        ]
      }
    },
    {
      id: 'savings-growth-trends',
      titleKey: 'labels.text.Savings Growth',
      type: 'chart',
      layout: 'two-thirds',
      adapter: 'savings-growth-trends',
      chartType: 'line',
      icon: 'chart-line',
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
      layout: 'one-third',
      adapter: 'disbursement-breakdown',
      chartType: 'doughnut',
      icon: 'chart-pie',
      visibleTo: {
        permissionsAny: [
          'READ_REPORT',
          'ALL_FUNCTIONS'
        ]
      }
    },
    {
      id: 'new-client-onboarding-trends',
      titleKey: 'labels.text.New Client Onboarding Trends',
      type: 'chart',
      layout: 'wide',
      adapter: 'new-client-onboarding-trends',
      chartType: 'line',
      icon: 'user-plus',
      visibleTo: {
        permissionsAny: [
          'READ_REPORT',
          'ALL_FUNCTIONS'
        ]
      }
    },
    {
      id: 'georeference-map',
      titleKey: 'labels.text.Georeference Map',
      type: 'chart',
      layout: 'wide',
      adapter: 'georeference-map',
      icon: 'globe',
      visibleTo: {
        permissionsAny: [
          'READ_REPORT',
          'ALL_FUNCTIONS'
        ]
      }
    }
  ]
};
