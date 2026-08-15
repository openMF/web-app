/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * Generates display/correlation keys for write actions.
 *
 * DISPLAY-ONLY (ADR-001 §04): the gateway mints the authoritative
 * Idempotency-Key server-side at action-card creation and ignores any
 * client-supplied key — a client-controllable dedup key would be a tampering
 * vector against Fineract's CommandSource dedup. This factory remains for
 * client-side labels and tracing only. Pure logic, see idempotency.spec.ts.
 */
export class IdempotencyKeyFactory {
  /**
   * Build a display key, e.g. `usr-42-approve_and_disburse_loan-107-1719360000000`.
   * Deterministic: identical inputs always yield the same key, which makes it a stable
   * label for tracing. It is NOT sent to Fineract and does not drive deduplication;
   * the gateway mints the authoritative Idempotency-Key. Timestamp is injected
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
