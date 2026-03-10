---
name: Mifos Web App Agent Skills
description: Core capabilities and rules for AI agents contributing to the MifosX Web App (Angular).
---

# Mifos Web App Skills

This file defines the procedural knowledge required for AI agents to successfully contribute to the Mifos X Web App.

## 1. UI Component Generation Skill

**When to Apply:** Creating new screens or views.

**Rules:**

- Prefer Angular Material components/directives for interactive UI.
- Use Material components where they exist (`<mat-table>`, `<mat-select>`) and Material directives on native controls where required (`<button mat-button>`, `<input matInput>`).
- Use the 8px grid system for margins and padding using either utility classes (e.g., `class="m-b-16"`) or inline CSS (e.g., `margin-bottom: 16px;`). Arbitrary values like `10px` or `15px` are strictly prohibited.

**Correct Example:**

```html
<mat-card>
  <mat-card-header>
    <mat-card-title>{{ 'Create.Client' | translate }}</mat-card-title>
  </mat-card-header>
  <mat-card-content class="m-b-16">
    <mat-form-field appearance="fill">
      <mat-label>{{ 'First.Name' | translate }}</mat-label>
      <input matInput formControlName="firstName" required />
    </mat-form-field>
  </mat-card-content>
</mat-card>
```

## 2. Forms & Data Binding Skill

**When to Apply:** Building forms to submit to the Fineract backend.

**Rules:**

- Use Angular **Reactive Forms** (`FormBuilder`, `FormGroup`, `FormControl`). Do NOT use Template-driven forms (`[(ngModel)]`).
- Always inject the `FormBuilder` in the constructor.

## 3. Translation & i18n Skill

**When to Apply:** Any time you are adding user-facing text to an HTML template or component.

**Rules:**

- Hardcoded English text is strictly prohibited in HTML templates.
- **ALWAYS** use the `@ngx-translate/core` pipe in templates.
- **Syntax:** `{{ 'Your.String.Here' | translate }}`
- If you add _new_ strings, you MUST run `npm run translations:extract` after modifying the HTML so it generates inside `src/translations/template.json`.

## 4. API & Data Fetching Skill

**When to Apply:** Connecting a UI component to Apache Fineract endpoints.

**Rules:**

- Data fetching should happen via Angular `Resolve` classes on the Route, OR via injected Services. Do not execute heavy HTTP logic directly inside the Component's `ngOnInit` if it blocks initial render unnecessarily.
- The UI exclusively communicates with the backend via REST. Use standard Angular `HttpClient`.

## 5. File Headers Compliance Skill

**When to Apply:** Whenever you create a **new** file (`.ts`, `.html`, `.scss`).

**Rules:**

- Before finalizing a PR or task, you MUST run `npm run headers:add` to prepend the required Mozilla Public License 2.0 (MPL-2.0) headers to your files.
- Verify with `npm run headers:check`.
