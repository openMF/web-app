# Module Boundaries

## Purpose

This document defines where new work should live so the repository stays maintainable and upgrade-safe.

## Core Rule

Do not place new behavior randomly into existing large modules. Choose the smallest correct boundary.

## Existing Core Areas

Existing MifosX modules such as clients, loans, groups, savings, products, accounting, reports, organization, and system should remain responsible for their current Fineract workflows.

Avoid changing these modules unless the requested feature directly belongs there.

## Recommended New Feature Areas

## Dashboard

Purpose:

- Executive and operator summaries.
- Portfolio, collection, arrears, and task summaries.

Allowed:

- KPI cards.
- Dashboard service.
- Summary tables.
- Read-only report/API aggregation.

Not allowed:

- Changing transaction behavior.
- Changing approval behavior.

## RiskOps Lite

Purpose:

- Explainable operational risk visibility.

Allowed:

- Risk signal cards.
- Restructure and renewal indicators.
- PAR and arrears summaries.
- Source-data links.

Not allowed:

- Autonomous credit decisions.
- Black-box scoring without governance.

## AI Copilot

Purpose:

- Read-only assistant for explanation, navigation, and summarization.

Allowed:

- Contextual help.
- Report explanation.
- Natural language search.

Not allowed:

- Posting transactions.
- Approving tasks.
- Disbursing loans.
- Reversing accounting entries.

## Shared Components

Purpose:

- Reusable UI elements.

Allowed:

- KPI cards.
- Status badges.
- Empty state components.
- Error state components.
- Tables and filters.

Not allowed:

- Business-specific API calls.
- Tenant-specific hardcoding.

## Core Services

Purpose:

- Cross-cutting infrastructure.

Allowed:

- Auth helpers.
- API helpers.
- configuration helpers.
- error handling.

Not allowed:

- Feature-specific business rules.

## Integration UX

Purpose:

- UI surfaces for approved integrations.

Allowed:

- Odoo launcher.
- External report links.
- Integration status screens.

Not allowed:

- Full universal integration hub implementation.
- Full accounting connector framework inside this repo.

## Decision Rule

When unsure, ask:

1. Is this a Fineract-native workflow?
2. Is this a read-only dashboard/risk view?
3. Is this a reusable shared UI component?
4. Is this future universal-platform functionality that should be out of scope?

If the answer is unclear, create an ADR before coding.
