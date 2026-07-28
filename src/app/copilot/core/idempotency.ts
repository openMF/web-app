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
   * Build a key, e.g. `usr-42-approve_and_disburse_loan-107-1719360000000`.
   * Deterministic: identical inputs always yield the same key, so a retry or
   * double-click reuses it and Fineract deduplicates. Timestamp is injected
   * (Date.now() is not called here) to keep the function pure and testable.
   */
  generate(userId: number, toolName: string, entityId: number, timestamp: number): string {
    const safeTool = this.slug(toolName);
    return `usr-${userId}-${safeTool}-${entityId}-${timestamp}`;
  }

  /** Lowercase, keep word chars, collapse the rest to underscores. */
  private slug(value: string): string {
    return (value ?? '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
  }
}
