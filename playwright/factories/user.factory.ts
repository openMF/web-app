/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * Factory for a freshly-created Fineract application user owned by
 * the current Playwright test.
 *
 * Design goals (per GSoC 2026 proposal WA-2.9):
 *  - Build a unique, shard-tagged username via {@link generateE2EName}
 *    so cleanup-grep tooling can identify orphaned rows.
 *  - Dedupe the office lookup through {@link ApiSetupManager}.
 *  - Generate a Fineract-compliant password deterministically — the
 *    backend enforces
 *    `^(?!.*(.)\\1)(?!.*\\s)(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^\\w\\s]).{12,50}$`
 *    (12–50 chars, ≥1 each of lower / upper / digit / special, no
 *    spaces, no two equal consecutive characters). The default
 *    generator below ALWAYS produces a passing string and exposes
 *    {@link generateE2EPassword} so unit specs can assert the shape
 *    in isolation.
 *  - Register the deleter immediately after a successful POST and
 *    never before.
 *
 * Portability note: this module imports only from the in-tree
 * Playwright infrastructure.
 */

import type { ApiSetupManager } from '../utils/api-setup-manager';
import type { CleanupGuard } from '../utils/cleanup-guard';
import { generateE2EName } from '../utils/naming';
import type { TestUser } from '../types/test-data.types';
import { resolveDefaultOfficeId } from './_shared';

/**
 * Fineract's `Super user` role id in the demo seed. Used as the
 * default role assignment because every E2E test that authenticates
 * as a custom-built user needs full read access to assert against UI
 * surfaces it does not own.
 */
export const DEFAULT_TEST_USER_ROLE_ID = 1;

/**
 * Regex copy of Fineract's password validator. Exported only for the
 * unit spec so the password generator can be proven correct by the
 * exact same rule the backend uses — keep the two in sync.
 */
export const FINERACT_PASSWORD_REGEX = /^(?!.*(.)\1)(?!.*\s)(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^\w\s]).{12,50}$/;

/**
 * Build a 14-character password that always satisfies
 * {@link FINERACT_PASSWORD_REGEX}, using a 4-character entropy tail
 * derived from `Math.random()` to keep parallel-worker collisions
 * unlikely. The structure is fixed so the regex is satisfied by
 * construction; only the trailing entropy varies between calls.
 *
 * @param random Injectable RNG returning a value in `[0, 1)`.
 *               Defaults to `Math.random`. Unit specs inject a
 *               deterministic source to assert exact output.
 */
export function generateE2EPassword(random: () => number = Math.random): string {
  // Fixed 10-char head: covers lower (`aB`), upper (`E2`), digit
  // (`3`), special (`!`), and avoids any consecutive-equal pair.
  // Char-by-char: a B 7 r J ! 2 q P # — pairwise distinct.
  // Adjacency check: a/B B/7 7/r r/J J/! !/2 2/q q/P P/# — all
  // pairs differ, so the no-repeat lookahead is satisfied for the
  // head regardless of what tail we append.
  const head = 'aB7rJ!2qP#';
  // 4-char tail drawn from a base36-ish alphabet (no uppercase, no
  // specials — the head already satisfies those classes). On every
  // draw we deterministically skip past `prev` so a pathological RNG
  // that returns the same value forever cannot wedge the loop.
  const alphabet = 'abcdefghjkmnpqrstuvwxyz23456789';
  let tail = '';
  let prev = head[head.length - 1];
  for (let i = 0; i < 4; i++) {
    const raw = Math.floor(random() * alphabet.length);
    const idx = Math.min(Math.max(raw, 0), alphabet.length - 1);
    let ch = alphabet[idx];
    if (ch === prev) {
      // Deterministic skip — picks the next alphabet character (with
      // wrap-around) so we never collide with `prev`.
      ch = alphabet[(idx + 1) % alphabet.length];
    }
    tail += ch;
    prev = ch;
  }
  return head + tail;
}

/** Caller-supplied tweaks to the default user payload. */
export interface CreateTestUserOverrides {
  /** Override the auto-generated username. */
  username?: string;
  /** Override the default firstname (`'E2E'`). */
  firstname?: string;
  /** Override the default lastname (`'User'`). */
  lastname?: string;
  /** Override the default email (`<username>@e2e.test`). */
  email?: string;
  /** Override the default office id (first office returned by Fineract). */
  officeId?: number;
  /**
   * Override the default role assignment (`[Super user]`). Pass an
   * empty array for a user with no roles.
   */
  roles?: readonly number[];
  /** Override the generated password. Must satisfy {@link FINERACT_PASSWORD_REGEX}. */
  password?: string;
  /**
   * Extra payload fields merged AFTER the defaults — use for
   * `staffId`, `passwordNeverExpires`, etc.
   */
  extra?: Record<string, unknown>;
}

/**
 * Result of {@link createTestUser}. Extends {@link TestUser} with the
 * cleartext password so a test that needs to log in as this user can
 * use the same credentials it just created — Fineract never returns
 * the password on subsequent GETs.
 */
export interface CreatedTestUser extends TestUser {
  /** The cleartext password sent at create-time. */
  password: string;
}

/**
 * Create an application user owned by the current test and queue its
 * deletion on the supplied {@link CleanupGuard}.
 *
 * @param setup     The per-test {@link ApiSetupManager}.
 * @param guard     The per-test {@link CleanupGuard}.
 * @param overrides See {@link CreateTestUserOverrides}.
 * @returns A {@link CreatedTestUser} projection carrying the cleartext
 *          password so the caller can immediately authenticate as the
 *          new user without re-deriving the credentials.
 */
export async function createTestUser(
  setup: ApiSetupManager,
  guard: CleanupGuard,
  overrides: CreateTestUserOverrides = {}
): Promise<CreatedTestUser> {
  const officeId = overrides.officeId ?? (await resolveDefaultOfficeId(setup));
  const username = overrides.username ?? generateE2EName('user');
  const firstname = overrides.firstname ?? 'E2E';
  const lastname = overrides.lastname ?? 'User';
  const email = overrides.email ?? `${username.toLowerCase()}@e2e.test`;
  const roles = overrides.roles ?? [DEFAULT_TEST_USER_ROLE_ID];
  const password = overrides.password ?? generateE2EPassword();

  if (!FINERACT_PASSWORD_REGEX.test(password)) {
    throw new Error(
      `createTestUser: supplied password does not satisfy Fineract's password policy ` +
        `(12-50 chars, mixed case, digit, special, no spaces, no consecutive equal chars)`
    );
  }

  const payload: Record<string, unknown> = {
    username,
    firstname,
    lastname,
    email,
    officeId,
    roles,
    sendPasswordToEmail: false,
    password,
    repeatPassword: password,
    ...overrides.extra
  };

  const response = await setup.api.createUser(payload);
  const resourceId: number = response.resourceId;
  if (typeof resourceId !== 'number') {
    throw new Error(
      `createTestUser: Fineract create-user response missing numeric resourceId, got ${JSON.stringify(response)}`
    );
  }

  guard.register(`user:${resourceId}`, async () => {
    await setup.api.deleteUser(resourceId);
  });

  // NOTE: `TestUser.roles` is documented as a list of role *names*,
  // but the create endpoint takes role *ids* and the create response
  // does not echo the names back. We deliberately leave `roles`
  // undefined in the projection rather than ship the numeric ids as
  // strings — callers that need the names should call
  // `setup.api.getUser(id)` and read `selectedRoles[].name`.
  return {
    resourceId,
    username,
    email,
    officeId,
    password
  };
}
