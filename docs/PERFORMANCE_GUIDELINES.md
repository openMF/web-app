# Performance Guidelines

## Purpose

The portal must remain fast and usable for branch, field, and management users even with large portfolios.

## Core Rules

- Do not load unnecessary data.
- Do not block screens on non-critical requests.
- Use pagination for large lists.
- Use filters before loading large datasets.
- Avoid expensive work inside templates.
- Avoid repeated API calls caused by lifecycle misuse.

## Dashboard Performance

Dashboards must:

- Load critical KPI cards first.
- Show loading states.
- Handle partial failures.
- Avoid loading every detail record when summaries are enough.
- Prefer report/summary endpoints where available.

## Tables and Lists

Large tables must support:

- Pagination.
- Filtering.
- Sorting where practical.
- Empty states.
- Error states.

Avoid client-side processing of very large datasets unless the dataset is known to be small.

## Charts

Charts should be simple and operationally useful.

Avoid excessive animations and heavy rendering.

## API Calls

Do not call APIs directly from visual components if the data is shared or transformed.

Use services for reusable data access and transformation.

## Caching

Use existing cache patterns carefully.

Do not cache sensitive or stale financial data unless behavior is understood.

## Bundle Size

Avoid adding large dependencies without review.

Before adding a dependency, ask:

- Can Angular/TypeScript already do this?
- Is the dependency actively maintained?
- Does it increase bundle size significantly?
- Is it used in more than one place?

## Mobile and Low Bandwidth

Design for users with slower networks.

Use:

- Progressive loading.
- Lightweight cards.
- Clear retry actions.
- Minimal unnecessary API calls.

## Performance Review Trigger

Performance review is required if a PR:

- Adds a new dashboard.
- Adds heavy charts.
- Loads large lists.
- Adds new dependencies.
- Changes shared API services.
- Adds repeated polling or timers.
