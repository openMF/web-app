# Architecture Principles

## Architecture Goal

Modernize and extend the MifosX Web App while preserving Apache Fineract compatibility and avoiding customer-specific forks.

## Primary Rule

The core banking system remains the system of record. This web app is an operations portal, workflow surface, dashboard surface, and productivity layer.

## Principles

## 1. Extend, Do Not Rewrite

Do not replace the existing application stack unless there is a clear approved architectural decision.

Use existing Angular modules, services, routing, interceptors, permissions, and API patterns whenever practical.

## 2. Configuration Over Customization

Customer differences should be handled through:

- Environment configuration.
- Tenant configuration.
- Feature flags.
- Menu configuration.
- Display configuration.
- Workflow configuration where possible.

Avoid customer-specific code branches.

## 3. Plugin Over Fork

New optional capabilities should be designed as feature modules or plugin-style extensions.

A feature should be easy to enable, disable, or hide per tenant/deployment.

## 4. API First

All new data interactions must go through services, not directly inside UI components.

Use existing Fineract-compatible API paths unless an approved backend extension exists.

## 5. Upgrade Safe

Avoid modifying core flows in ways that make future upstream upgrades difficult.

Before changing existing modules, ask:

- Is this change compatible with Fineract behavior?
- Does it break existing permissions?
- Does it affect accounting, loan, savings, client, group, or maker-checker flows?
- Can this be added as a new component or service instead?

## 6. Modular First

Keep features organized by bounded context:

- Dashboard.
- Clients.
- Loans.
- Collections.
- Reports.
- RiskOps Lite.
- AI Copilot.
- Tenant configuration.

Shared reusable UI belongs in shared modules, not copied across features.

## 7. Smart Components and Dumb Components

Container components may orchestrate data loading.

Presentation components should be reusable, input-driven, and avoid direct API calls.

## 8. Explainable Risk

RiskOps Lite must start with explainable rules.

Do not introduce black-box scoring unless source data, model behavior, governance, and review process are approved.

## 9. Secure by Design

Do not store secrets in source code.

Do not bypass existing authentication and tenant header behavior.

Do not expose sensitive client data unnecessarily.

## 10. Testable by Default

New services should be unit-testable.

New UI should handle:

- Loading state.
- Empty state.
- Error state.
- Permission-restricted state.

## 11. Observable and Supportable

Important operational failures should be visible through logs or user-friendly error states.

Production support must be considered before adding complex features.

## 12. Commercial Product Thinking

Every feature should improve reusable commercial value, not only solve a single customer request.

Before coding, ask:

- Is this reusable across multiple MFIs?
- Can this be configured instead of customized?
- Does this improve productivity, risk visibility, or operational control?
- Will this remain maintainable after one year?
