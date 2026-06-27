# Apache Fineract Extension Guide

## Purpose

This repository extends the MifosX Web App experience while preserving Apache Fineract compatibility.

## System of Record

Apache Fineract remains the system of record for core financial data and operations.

The web app must not duplicate or replace Fineract business authority.

## Extension Rules

## 1. Use Existing APIs First

Prefer existing Fineract APIs and reports before requesting backend changes.

## 2. Preserve Tenant Header Behavior

Do not manually duplicate tenant header behavior inside every service.

Use the existing request interceptor pattern.

## 3. Preserve Authentication Behavior

Do not bypass existing Basic, OAuth, or OIDC behavior.

Do not create parallel login/session mechanisms without approved architecture.

## 4. Preserve Permissions

New screens and actions must respect existing permissions and role behavior.

Do not expose restricted actions through new shortcuts.

## 5. Avoid Core Workflow Changes

Do not change behavior for:

- Loan creation.
- Disbursement.
- Repayment.
- Waiver.
- Write-off.
- Reschedule/restructure.
- Savings transactions.
- Journal entries.
- Maker-checker approvals.

unless explicitly approved.

## 6. Use Read-Only Aggregation for Dashboards

Dashboards should aggregate and display data. They should not mutate financial data.

## 7. Explain Risk Signals

Risk indicators must be traceable to source data such as loan status, arrears, transaction history, or reports.

## 8. Keep Upgrade Safety

Avoid deep modifications to existing core modules where a new dashboard component, wrapper, or extension module can achieve the same outcome.

## New Feature Review Questions

Before implementation, answer:

1. Which Fineract API or report endpoint is used?
2. Is this read-only or write action?
3. Which permission controls it?
4. Which tenant behavior is expected?
5. What existing workflow could be affected?
6. Can this be implemented without backend change?

## Backend Change Rule

Backend changes require an explicit architecture decision.

Frontend-only improvements should be preferred for dashboard, navigation, search, reporting, and read-only risk visibility.

## Integration Rule

This repository may include integration user interfaces, links, status views, and configuration screens.

Full connector engines belong outside this repository unless explicitly approved.
