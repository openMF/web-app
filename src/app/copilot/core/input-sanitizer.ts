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

/** Known prompt-injection phrasings, kept narrow to avoid blocking real banking queries. */
const INJECTION_PATTERNS: RegExp[] = [
  /ignore\s+(?:all\s+|any\s+|the\s+)?(?:previous\s+|prior\s+|above\s+|earlier\s+)?(?:instructions?|prompts?|rules?|context|directives?)/i,
  /disregard\s+(?:all\s+|the\s+)?(?:previous|prior|above)\b/i,
  /forget\s+(?:all\s+(?:your\s+)?|everything\s+)?(?:previous|prior|instructions?)/i,
  /you\s+are\s+now\s+(?:a|an|in|free|dan|developer)\b/i,
  /act\s+as\s+(?:an?\s+)?(?:ai|assistant|admin|administrator|system|developer|dan|jailbroken)\b/i,
  /pretend\s+(?:to\s+be|you(?:'re|\s+are))/i,
  /(?:system|developer)\s+prompt/i,
  /(?:reveal|show|print|repeat)\s+(?:your|the)\s+(?:system\s+)?(?:prompt|instructions)/i,
  /override\s+(?:your\s+|the\s+)?(?:instructions|rules|system)/i,
  /prompt\s+injection/i,
  /developer\s+mode/i,
  /jailbreak/i
];

/**
 * First security gate: runs on every message before it leaves the frontend.
 * Pure logic, no Angular dependency - see input-sanitizer.spec.ts.
 */
export class InputSanitizer {
  /** Remove script/style blocks, HTML tags, invisible/control characters, then collapse whitespace. */
  stripDangerous(input: string): string {
    return (input ?? '')
      .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
      .replace(/<\/?[a-zA-Z][^>]*>/g, '')
      .replace(/\p{Cf}/gu, '')
      .replace(/\p{Cc}/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /** True when the text contains a known prompt-injection phrasing. */
  matchesInjectionPattern(input: string): boolean {
    return INJECTION_PATTERNS.some((pattern) => pattern.test(input));
  }

  /** Clean -> length check -> injection check. Returns the cleaned text when allowed. */
  sanitize(input: string): SanitizeResult {
    const cleaned = this.stripDangerous(input);
    if (cleaned.length === 0 || cleaned.length > MAX_INPUT_LENGTH) {
      return { blocked: true, reason: 'invalid_length' };
    }
    if (this.matchesInjectionPattern(cleaned)) {
      return { blocked: true, reason: 'injection_detected' };
    }
    return { blocked: false, text: cleaned };
  }
}
