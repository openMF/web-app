/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * Generates idempotency / correlation keys for write actions.
 * The same key flows from the chat message through the MCP server into
 * Fineract's CommandSource table and the audit trail, so a retry or
 * double-click can never execute twice. Pure logic, see idempotency.spec.ts.
 */
export class IdempotencyKeyFactory {
  /**
   * Build a key, e.g. `usr-42-approve_and_disburse_loan-107-<ts>`.
   * @param timestamp injected (Date.now() is not called inside core logic to keep it testable).
   */
  generate(_userId: number, _toolName: string, _entityId: number, _timestamp: number): string {
    // TODO: assemble deterministic key.
    throw new Error('Not implemented');
  }
}
