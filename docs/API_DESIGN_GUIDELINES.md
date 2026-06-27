# API Design Guidelines

## Purpose

This guide keeps frontend API usage clean, reusable, and compatible with Apache Fineract.

## Core Rule

Use existing Fineract APIs and the existing interceptor architecture before creating new integration patterns.

## Do

- Use relative URLs for Fineract API calls where possible.
- Let interceptors apply base URL, tenant header, and auth header.
- Put API calls inside services.
- Add typed interfaces for new response shapes.
- Handle loading, empty, and error states.
- Keep transformations testable.

## Do Not

- Hardcode full API URLs in components.
- Duplicate tenant/auth headers in every service.
- Put API calls directly inside visual-only components.
- Store API keys in frontend code.
- Mix external API behavior into Fineract services.

## Service Design

A service should have a clear purpose.

Examples:

- `DashboardService` for dashboard summaries.
- `RiskSignalService` for explainable risk indicators.
- `CollectionWorkspaceService` for collection queues.

Avoid creating generic catch-all services.

## Error Handling

API users must see friendly error states.

Errors should be handled without breaking the full screen where possible.

## External APIs

External integrations must be isolated.

Examples:

- Odoo UI link or status screen.
- Notification provider status.
- Reporting provider link.

Do not build a full universal integration hub in this repository.

## Write Actions

Write actions require extra review if they affect:

- Loan state.
- Savings state.
- Client records.
- Group records.
- Accounting records.
- Maker-checker tasks.

## Read-Only Aggregation

Dashboards, reports, and RiskOps Lite should prefer read-only aggregation.

## API Review Checklist

Before approval, answer:

1. Which endpoint is used?
2. Is it read-only or write?
3. Which permission controls it?
4. Is tenant behavior preserved?
5. Are errors handled?
6. Is the response typed?
7. Can the same service be reused elsewhere?
