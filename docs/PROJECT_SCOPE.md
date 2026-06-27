# Project Scope: MifosX Commercial Operations Portal

## Product Identity

This repository is the **MifosX Commercial Operations Portal (MCOP)**.

It is an upgrade-safe commercial extension of the existing MifosX Web App for Apache Fineract-based financial institutions.

## Strategic Position

This repository is **not** the Universal Financial Operations Platform itself.

It is the **Fineract/MifosX Provider Portal** that can later connect to a broader Universal Financial Operations Platform.

## Core Principles

- Never rewrite Apache Fineract.
- Never rewrite the entire MifosX Web App.
- Never create customer-specific frontend forks.
- Extend instead of replace.
- Configuration over customization.
- Plugin over fork.
- API first.
- Upgrade-safe.
- Multi-tenant ready.
- AI-ready.
- Commercial SaaS ready.

## In Scope

### User Experience Modernization

- Executive dashboard.
- Portfolio dashboard.
- Client 360.
- Loan 360.
- Collection workspace.
- Branch workspace.
- Field officer workspace.
- Task and approval workspace.

### RiskOps Lite

- Portfolio truth.
- PAR monitoring.
- Arrears monitoring.
- Restructure surveillance.
- Renewal and evergreening warning.
- Promise-to-pay tracking.
- Branch and field officer risk visibility.

### Productivity Features

- Global search improvements.
- Quick actions.
- Saved views.
- Notification center.
- Better task navigation.
- Operator-friendly workflow shortcuts.

### Tenant and Deployment Features

- Branding.
- Feature flags.
- Configurable menus.
- Country and localization configuration.
- Runtime deployment configuration.

### AI Features

- Read-only AI Copilot.
- Report explanation.
- Risk explanation.
- Natural language search.
- Contextual help.

AI features must not make autonomous credit, accounting, or transaction decisions.

### Integration UX

- Odoo launcher or integration UI.
- Reporting links.
- Notification integration UI.
- External API integration screens where appropriate.

## Explicitly Out of Scope

The following must not be implemented inside this repository as full platform engines:

- Universal multi-CBS adapter framework.
- Universal business model.
- Universal field mapping engine.
- Plugin marketplace.
- Universal workflow platform.
- Payment hub.
- Accounting connector framework.
- Integration hub.
- Cross-CBS AI platform.

These belong in a future separate repository such as `universal-finops-platform`.

## Relationship to Future Universal Platform

Future target:

```text
Universal Financial Operations Platform
        |
        v
Provider Adapter Layer
        |
        v
MifosX Commercial Operations Portal
        |
        v
Apache Fineract
```

This repository should remain a clean, Fineract-compatible portal and not absorb universal platform responsibilities.

## Success Criteria

The repository must remain:

- Compatible with Apache Fineract.
- Upgrade-safe with upstream MifosX direction.
- Modular.
- Testable.
- Secure.
- Observable.
- Maintainable.
- Commercially deployable.

Every new feature must increase operational productivity without creating customer-specific forks.
