# Security Guidelines

## Purpose

Security must be designed into every feature because this portal works with financial, client, loan, and operational data.

## Core Rules

- Do not store secrets in source code.
- Do not hardcode credentials, API keys, tenant IDs, or institution-specific values.
- Do not bypass existing authentication.
- Do not bypass tenant header behavior.
- Do not expose restricted actions through shortcuts.
- Do not weaken existing permission checks.

## Authentication

Use existing authentication paths and interceptors.

Any change to Basic, OAuth, OIDC, token storage, logout, or refresh behavior requires architecture review.

## Authorization

New screens and actions must respect existing permissions.

Read-only dashboard widgets must not expose data beyond the current user's authority.

## Tenant Safety

Tenant selection and server switching are useful for development and demos but must be controlled for production deployments.

Production deployments should prefer controlled runtime configuration.

## Data Exposure

Protect sensitive client and account data.

Avoid unnecessary display of:

- National ID.
- Full address.
- Phone numbers.
- Sensitive notes.
- Account identifiers.
- Personally identifiable data.

Use masking or limited display where appropriate.

## AI Safety

AI Copilot must be read-only unless a future approved governance model exists.

AI must not:

- Approve tasks.
- Post transactions.
- Reverse transactions.
- Disburse loans.
- Change client data.
- Change accounting data.

## External Integrations

External APIs must be isolated and configurable.

Do not place API keys in frontend source.

If a key is required, use a backend proxy or approved secure integration pattern.

## Logging

Do not log sensitive data.

Avoid logging:

- Passwords.
- Tokens.
- Full client records.
- National IDs.
- Payment details.

## Dependency Safety

Dependency upgrades must be reviewed carefully and should not be mixed with feature changes.

## Security Review Trigger

Security review is required if a PR changes:

- Authentication.
- Authorization.
- Tenant handling.
- Token/session storage.
- External API integration.
- Client data display.
- Financial transaction workflows.
- AI behavior.
