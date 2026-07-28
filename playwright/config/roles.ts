/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * Auth role registry — single source of truth for "who can log in".
 *
 * Per GSoC 2026 proposal WA-2.2 (Multi-role storageState foundation).
 *
 * Each role declares:
 *  - `id`               — stable identifier used in storageState filenames
 *                          and Playwright project names
 *  - `usernameEnv`      — env var that supplies the username
 *  - `passwordEnv`      — env var that supplies the password
 *  - `defaultUsername`  / `defaultPassword` — fall-backs used locally when
 *                          the env vars are absent. The default role uses
 *                          the seed Fineract super-user (`mifos`/`password`);
 *                          the `restricted` role has no default because the
 *                          seed data varies by environment, so missing
 *                          credentials produce a loud, fast failure.
 *  - `storageStateFile` — path Playwright writes after auth.setup
 *  - `description`      — human-readable diagnostic
 *
 * Adding a new role is purely additive: register it here, drop in a
 * matching `auth.<id>.setup.ts`, and Playwright's config will pick up
 * a `setup-<id>` project automatically (see `playwright.config.ts`).
 *
 * The shape of this file is intentionally framework-agnostic: the
 * React repo can adopt the exact same registry once it grows past a
 * single role.
 */
export interface AuthRole {
  id: string;
  usernameEnv: string;
  passwordEnv: string;
  defaultUsername: string;
  defaultPassword: string;
  storageStateFile: string;
  description: string;
}

/**
 * The `default` role mirrors the legacy single-role behavior so the
 * existing `auth.setup.ts` and `chromium` project keep working
 * unchanged. Storage state path is preserved at
 * `playwright/.auth/user.json` to avoid touching any spec.
 */
export const ROLES = {
  default: {
    id: 'default',
    usernameEnv: 'E2E_USERNAME',
    passwordEnv: 'E2E_PASSWORD',
    defaultUsername: 'mifos',
    defaultPassword: 'password',
    storageStateFile: 'playwright/.auth/user.json',
    description: 'Default Fineract super-user (mifos/password).'
  },
  admin: {
    id: 'admin',
    usernameEnv: 'E2E_ADMIN_USERNAME',
    passwordEnv: 'E2E_ADMIN_PASSWORD',
    defaultUsername: 'mifos',
    defaultPassword: 'password',
    storageStateFile: 'playwright/.auth/admin.json',
    description: 'Full-permission admin role for write-path tests.'
  },
  restricted: {
    id: 'restricted',
    usernameEnv: 'E2E_RESTRICTED_USERNAME',
    passwordEnv: 'E2E_RESTRICTED_PASSWORD',
    // No safe default — restricted accounts are environment-specific.
    // The setup will fail loudly if the env vars are not provided.
    defaultUsername: '',
    defaultPassword: '',
    storageStateFile: 'playwright/.auth/restricted.json',
    description: 'Read-only / limited-permission role for authorization tests.'
  }
} as const satisfies Record<string, AuthRole>;

export type RoleId = keyof typeof ROLES;
