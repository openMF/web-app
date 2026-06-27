# Contributing with AI

## Purpose

This guide explains how AI-assisted contributors should work in this repository.

## Core Mindset

This is a commercial financial operations portal built on top of MifosX and Apache Fineract.

Contributors must optimize for safety, compatibility, maintainability, and reusable product value.

## Before Coding

Answer these questions:

1. What business problem is being solved?
2. Which users benefit?
3. Which existing module already supports part of this?
4. Which Fineract API or report is used?
5. What existing workflow could break?
6. What is the smallest safe PR?

## Coding Rules

- Keep changes small.
- Reuse existing modules and services.
- Do not rewrite the app.
- Do not bypass existing auth, tenant, or permission behavior.
- Do not add customer-specific code.
- Do not mix dependency upgrades with feature work.
- Do not introduce unused abstractions.
- Do not make unrelated formatting changes.

## Documentation Rules

Update documentation when changing:

- Architecture.
- Workflow.
- RiskOps behavior.
- AI behavior.
- API usage.
- Security-sensitive behavior.
- Deployment behavior.

## Pull Request Requirements

Every PR must include:

- Business purpose.
- Scope.
- Out-of-scope items.
- Fineract compatibility notes.
- Changed files.
- APIs used.
- Tests run.
- Known limitations.
- Screenshots for UI changes.

## Human Review

AI may propose and implement. Humans approve.

Human approval is required for:

- Architecture decisions.
- Business logic decisions.
- Financial workflow changes.
- Security-sensitive changes.
- Merge readiness.

## Forbidden Changes Without Explicit Approval

- Replacing Angular.
- Rewriting MifosX flows.
- Changing loan transaction behavior.
- Changing accounting transaction behavior.
- Changing maker-checker behavior.
- Adding autonomous AI actions.
- Hardcoding tenant-specific behavior.

## Done Means

A contribution is not done until it satisfies `docs/DEFINITION_OF_DONE.md`.
