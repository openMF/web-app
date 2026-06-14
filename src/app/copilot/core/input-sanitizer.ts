/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Result of running user input through the sanitizer. */
export interface SanitizeResult {
  blocked: boolean;
  text?: string;
  reason?: 'invalid_length' | 'injection_detected';
}

export const MAX_INPUT_LENGTH = 500;

/**
 * First security gate: runs on every message before it leaves the frontend.
 * Pure function, no Angular dependency - see input-sanitizer.spec.ts.
 */
export class InputSanitizer {
  /** Strip HTML/script tags and obvious SQL fragments. */
  stripDangerous(_input: string): string {
    // TODO: implement tag/script/SQL stripping.
    throw new Error('Not implemented');
  }

  /** Detect prompt-injection phrasing, e.g. "ignore previous instructions". */
  matchesInjectionPattern(_input: string): boolean {
    // TODO: implement injection pattern matching.
    throw new Error('Not implemented');
  }

  /** Main entry point. */
  sanitize(_input: string): SanitizeResult {
    // TODO: clean -> length check -> injection check.
    throw new Error('Not implemented');
  }
}
