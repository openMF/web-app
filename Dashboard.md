# Financial Analytics Dashboards

This document provides a comprehensive guide detailing dashboard metrics, RBAC widget governance, configuration guidelines, and runtime feature toggles.

## 📋 Table of Contents

- [Overview](#overview)
- [Dashboards Overview & Information](#dashboards-overview--information)
  - [1. Executive Global Financial Dashboard](#1-executive-global-financial-dashboard)
  - [2. Institutional Operations & Widget Governance](#2-institutional-operations--widget-governance)
  - [3. Account-Level Analytics Dashboards](#3-account-level-analytics-dashboards)
- [How to Enable & Configure](#how-to-enable--configure)
  - [Feature Flag Configuration](#feature-flag-configuration)
  - [Environment Variables](#environment-variables)
- [Role-Based Access Control (RBAC) & Grants](#role-based-access-control-rbac--grants)

## Overview

The Financial Analytics Dashboards provide operational insights, portfolio risk metrics, financial inclusion indicators, and role-governed data visualizations across the Mifos Web App ecosystem.
It spans three primary dashboards:

1. **Executive Global Financial Dashboard** (`/#/dashboard`): Strategic institutional portfolio overview, OpenStreetMap georeference mapping, financial inclusion metrics, and export capabilities.
2. **Institutional Operations & Manage Dashboards** (`/#/system/manage-dashboards`): Live operations control, deposit aggregation, auto-refresh monitoring, and RBAC widget governance.
3. **Account-Level Analytics Dashboards** (`/#/loans/accounts/:id/dashboard`, `/#/savings/accounts/:id/dashboard`): Deep-dive analytics for individual loan and savings accounts.

## Dashboards Overview & Information

### 1. Executive Global Financial Dashboard

**Route**: `/#/dashboard`  
**Purpose**: High-level strategic overview for C-level executives, portfolio managers, and regional directors.

#### **Default KPI Metric Cards**

- **Active Borrowers**: Total number of active borrower accounts across all branches.
- **Active Savers**: Total active savings accounts count.
- **Average Loan Size**: Mean principal disbursement per borrower.
- **Total Savings**: Aggregated portfolio balance across all savings products.
- **Women Borrowers %**: Gender inclusion tracking indicator.
- **Youth Clients**: Inclusivity metric for borrowers aged 18–35.
- **Rural Clients**: Geographical financial inclusion ratio.

#### **Interactive Charts & Visualizations**

- **Portfolio Growth & Loan Distribution**: Interactive Chart.js doughnut/bar breakdown across loan products and sector categories.
- **Financial Flow Trends**: Monthly breakdown comparing Disbursements, Savings Deposits, and Loan Repayments.
- **Client Onboarding Trends**: Historical client growth curve over configurable time periods.
- **Georeference Map (OpenStreetMap & Leaflet)**:
  - Interactive land-anchored branch and client cluster pins.
  - Custom map pin pulses and cluster size indicators.
  - Hover tooltips and click popups displaying localized branch statistics (Clients, Loans, Savings, Collections, Flag).

#### **Global Filters & Export Tools**

- **Filters**: Branch Office filter, Loan Product selector, and Time Period selector (Day, Week, Month, Year).
- **Export Options**: PDF Report generation (with clean print layout optimization) and CSV Data Export.

### 2. Institutional Operations & Widget Governance

**Route**: `/#/system/manage-dashboards`  
**Purpose**: System administration dashboard for monitoring operational flow and managing widget visibility per user role.

#### **Institutional Operations Overview (Tab 1)**

- **Live Business KPIs**:
  - **Clients Overview**: Live client count, active percentage, pending clients, and new monthly onboardings.
  - **Loan Portfolio**: Total disbursed amount, active loan count, and total outstanding balance.
  - **Total Deposits**: Consolidated aggregate balance across Demand Savings, Fixed Deposits, and Recurring Deposits.
  - **Share Capital**: Total active share value, shareholder count, and total issued shares.
- **Interactive Chart Controls**:
  - Switchable **Doughnut / Pie** transaction split chart.
  - Switchable **Bar / Line** monthly business trend chart.
- **Auto-Refresh Engine**:
  - Background auto-refresh timer running every 10 minutes with status indicator.
  - Manual **Refresh** button with animated status feedback.

#### **Widget Governance & RBAC Management (Tab 2)**

- **Tenant-Level Toggle**: Enable or disable individual widgets across the application.
- **Multi-Role Assignment**: Assign specific user roles (e.g., Super User, Branch Manager, Credit Officer, Auditor) to each widget.
- **Live Search & Category Filter**: Filter widgets by category (Loans, Savings, Clients, System, Transactions).
- **Unsaved Changes Detection**: Confirmation dialogs preventing accidental navigation loss.

### 3. Account-Level Analytics Dashboards

#### **Loan Account Analytics Dashboard**

**Route**: `/#/loans/accounts/:id/dashboard`

- **KPI Metrics**: Principal Amount, Total Repaid Amount, Outstanding Principal Balance, Interest Charged.
- **Repayment Progress Chart**: Doughnut chart visualizing principal paid vs. remaining balance.
- **Amortization Breakdown**: Stacked bar/line chart tracking principal vs. interest schedule progression over time.

#### **Savings Account Analytics Dashboard**

**Route**: `/#/savings/accounts/:id/dashboard`

- **KPI Metrics**: Available Balance, Total Deposits Amount, Total Withdrawals Amount, Interest Earned.
- **Historical Balance Trend**: Line chart depicting savings balance growth over account lifecycle.
- **Transaction Distribution**: Doughnut chart detailing deposit vs. withdrawal vs. fee distribution.

## How to Enable & Configure

### Feature Flag Configuration

The Global Financial Dashboard feature is controlled by a runtime environment flag `enableGlobalDashboard`.

#### 1. Local Development (`src/assets/env.js`)

Set `enableGlobalDashboard` to `true` in `src/assets/env.js`:

```javascript
(function (window) {
  window['env'] = window['env'] || {};
  window['env']['enableGlobalDashboard'] = true;
})(this);
```

#### 2. Environment Files (`src/environments/`)

Configured in `environment.ts` and `environment.prod.ts` with explicit string/boolean normalization:

```typescript
export const environment = {
  production: false,
  enableGlobalDashboard: loadedEnv.enableGlobalDashboard === 'true' || loadedEnv.enableGlobalDashboard === true || false
};
```

Both boolean (`true` / `false`) and string (`"true"` / `"false"`) representations are supported, ensuring string `"false"` injected by container environments correctly evaluates to `false`.

### Environment Variables

When running via Docker or Nginx deployment, pass the environment variable `$MIFOS_ENABLE_GLOBAL_DASHBOARD`:

```bash
# Docker run example
docker run -d -p 4200:80 \
  -e MIFOS_ENABLE_GLOBAL_DASHBOARD=true \
  openmf/web-app:latest
```

This updates `env.js` dynamically at container startup without rebuilding the Angular application assets.

## Role-Based Access Control (RBAC) & Grants

### How to Grant Widget Permissions

1. Log in as a System Administrator.
2. Navigate to **System > Manage Dashboards** (`/#/system/manage-dashboards`).
3. Click on the **Widget Configuration & RBAC** tab.
4. Locate the target widget (e.g., _Loan Portfolio Overview_, _Georeference Map_).
5. Toggle **Enable Widget** to turn it on/off tenant-wide.
6. Under **Roles**, select the specific user roles authorized to view the widget.
7. Click **Save Widget Configurations** to apply changes instantly.
