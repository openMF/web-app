/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { BaseTellerWorkflow } from './base-teller-workflows';

/** An operation together with the translated text the search matches against. */
export interface SearchableOperation {
  workflow: BaseTellerWorkflow;
  label: string;
  description: string;
  /** Translated synonyms, e.g. "abono", "ingreso" for a deposit. */
  terms: readonly string[];
}

/**
 * Lowercases, strips diacritics and collapses whitespace so "Depósito", "DEPOSITO" and " deposito " compare equal.
 */
export function normalizeSearchText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{M}+/gu, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/** Splits a translated, comma/semicolon/pipe separated synonym list. A missing translation (the key echoed back) yields none. */
export function parseSearchTerms(translated: string, key: string): string[] {
  if (!translated || translated === key) {
    return [];
  }
  return translated
    .split(/[,;|]/)
    .map((term) => term.trim())
    .filter((term) => term.length > 0);
}

function includesAll(haystack: string, tokens: readonly string[]): boolean {
  return tokens.every((token) => haystack.includes(token));
}

/**
 * Ranks how well one operation matches. Lower is better; `null` means no match.
 *
 * 0 name starts with the query, 1 name contains it, 2 a synonym contains it, 3 description contains it, 4 the words are
 * spread across name, synonyms and description. Every word of the query must match (partial phrases are supported).
 */
function rank(item: SearchableOperation, query: string, tokens: readonly string[]): number | null {
  const label = normalizeSearchText(item.label);
  if (label.startsWith(query)) {
    return 0;
  }
  if (includesAll(label, tokens)) {
    return 1;
  }
  const terms = item.terms.map(normalizeSearchText);
  if (terms.some((term) => includesAll(term, tokens))) {
    return 2;
  }
  const description = normalizeSearchText(item.description);
  if (includesAll(description, tokens)) {
    return 3;
  }
  const everything = [
    label,
    ...terms,
    description
  ].join(' ');
  return includesAll(everything, tokens) ? 4 : null;
}

/**
 * Filters and ranks operations for a query. An empty query returns an empty list; the caller decides to show the
 * regular grouped view instead. Callers pass only authorised operations, so results can never reveal a hidden one.
 */
export function searchOperations(items: readonly SearchableOperation[], rawQuery: string): SearchableOperation[] {
  const query = normalizeSearchText(rawQuery);
  if (query === '') {
    return [];
  }
  const tokens = query.split(' ');
  return items
    .map((item, index) => ({ item, index, score: rank(item, query, tokens) }))
    .filter((entry): entry is { item: SearchableOperation; index: number; score: number } => entry.score !== null)
    .sort((a, b) => a.score - b.score || a.index - b.index)
    .map((entry) => entry.item);
}
