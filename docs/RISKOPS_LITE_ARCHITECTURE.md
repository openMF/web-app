# RiskOps Lite Architecture

## Purpose

RiskOps Lite adds explainable operational risk visibility to the MifosX Web App without replacing Apache Fineract and without introducing black-box decisioning.

## Scope

RiskOps Lite is a read-only and explainable risk visibility layer.

It helps users see risk signals earlier and navigate to the source data.

## In Scope

- PAR visibility.
- Arrears visibility.
- Restructure surveillance.
- Renewal and evergreening warning.
- Branch risk summary.
- Field officer risk summary.
- Portfolio concentration summary.
- Promise-to-pay visibility.
- Collection exception indicators.

## Out of Scope

- Automated credit approval.
- Automated loan rejection.
- Automated write-off.
- Automated restructuring.
- Black-box scoring.
- Replacement of official Fineract reports.

## Design Principles

## 1. Explainable First

Every risk signal must answer:

- What happened?
- Why is it risky?
- Which client, loan, branch, or report supports the signal?
- What should the user review next?

## 2. Source Traceability

Each signal should link back to source data where practical:

- Client.
- Loan account.
- Group.
- Center.
- Office.
- Report.

## 3. Rule-Based First

Start with deterministic rules before AI or ML.

Example signals:

- Loan is overdue after restructure.
- Client has repeated renewals.
- Loan term was extended multiple times.
- Branch arrears exceed configured threshold.
- Field officer portfolio has high overdue concentration.

## 4. Tenant Configurable

Thresholds should be configurable later:

- PAR warning level.
- Overdue days threshold.
- Renewal frequency threshold.
- Restructure count threshold.
- Branch concentration threshold.

## 5. No Hidden Action

RiskOps Lite must not perform financial actions. It only explains and routes users to review.

## Suggested Components

```text
src/app/riskops-lite/
  riskops-lite.module.ts
  riskops-lite-routing.module.ts
  riskops-dashboard.component.ts
  services/
    risk-signal.service.ts
    portfolio-risk.service.ts
  components/
    risk-signal-card/
    branch-risk-table/
    restructure-watchlist/
    evergreening-watchlist/
```

## MVP Signals

1. PAR summary.
2. Overdue loan watchlist.
3. Restructured loan watchlist.
4. Renewal warning list.
5. Branch risk table.
6. Loan officer risk table.

## Definition of Done

- Signals are explainable.
- Source links exist where practical.
- Empty states exist.
- Error states exist.
- Existing workflows are not changed.
- No autonomous decisioning is introduced.
