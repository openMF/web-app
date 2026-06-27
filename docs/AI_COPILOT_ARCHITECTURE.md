# AI Copilot Architecture

## Purpose

AI Copilot is a read-only assistant for users of the MifosX Commercial Operations Portal.

It helps explain reports, risk signals, workflows, and navigation. It must not perform financial actions.

## Scope

## In Scope

- Report explanation.
- Risk signal explanation.
- Natural language search.
- Contextual help.
- Workflow guidance.
- Documentation assistance.

## Out of Scope

- Approving maker-checker tasks.
- Posting transactions.
- Reversing transactions.
- Disbursing loans.
- Editing client data.
- Editing accounting data.
- Autonomous lending decisions.

## Design Principles

## 1. Read-Only First

The first version must be read-only.

The Copilot can explain and guide, but it cannot change financial data.

## 2. Context-Aware

Copilot responses should use current page context where available:

- Client.
- Loan.
- Office.
- Report.
- Risk signal.
- User role.

## 3. Source Traceability

When explaining a risk signal or report, Copilot should reference the source data or screen context where practical.

## 4. Permission-Aware

Copilot must not reveal data the user cannot access through the normal UI.

## 5. No Secret Exposure

Copilot must not expose tokens, credentials, internal configuration, or sensitive data beyond the user permission scope.

## 6. Explainable Risk

For risk signals, Copilot should explain:

- What the signal means.
- Why it matters.
- Which source data supports it.
- What the user should review next.

## Suggested Module

```text
src/app/ai-copilot/
  ai-copilot.module.ts
  ai-copilot-routing.module.ts
  copilot-panel.component.ts
  copilot.service.ts
  context-provider.service.ts
```

## Human Approval Required For

- Any write action.
- Any integration with external AI provider.
- Any use of client-sensitive data.
- Any change to auth/session behavior.
- Any automated recommendation that could affect credit or accounting decisions.

## MVP Definition

The first Copilot MVP should:

- Be feature-flagged.
- Be read-only.
- Explain current dashboard/report/risk signal.
- Provide navigation help.
- Fail safely if unavailable.
