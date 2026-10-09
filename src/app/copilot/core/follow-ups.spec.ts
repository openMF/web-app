/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { describe, it, expect } from '@jest/globals';

import { fallbackFollowUps } from './follow-ups';

describe('fallbackFollowUps', () => {
  it('offers loan questions from a loan', () => {
    expect(fallbackFollowUps('loan-detail')).toEqual([
      'copilot.suggestions.repaymentSchedule',
      'copilot.suggestions.clientDetails',
      'copilot.suggestions.savingsBalance'
    ]);
  });

  /** Offering "show me this client's profile" to someone already reading it is not a suggestion. */
  it('does not offer the client profile back on the client page', () => {
    expect(fallbackFollowUps('client-detail')).not.toContain('copilot.suggestions.clientDetails');
  });

  /** Away from a record, only what can be answered from anywhere. */
  it('falls back to what holds on any screen', () => {
    expect(fallbackFollowUps('dashboard')).toEqual([
      'copilot.suggestions.clientDetails',
      'copilot.suggestions.overdueLoans'
    ]);
    expect(fallbackFollowUps('organization')).toEqual(fallbackFollowUps('dashboard'));
    expect(fallbackFollowUps(null)).toEqual(fallbackFollowUps('dashboard'));
    expect(fallbackFollowUps(undefined)).toEqual(fallbackFollowUps('dashboard'));
  });

  /**
   * The screen name is the first segment of the route the officer is on, and an unknown route
   * renders "not found" at that URL rather than redirecting, so these names are reachable by
   * mistyping an address. Off an object literal they find Object.prototype and its members —
   * and 'constructor' answers with a function whose length is 1, which is truthy enough to get
   * past the chip row's guard and then hand *ngFor something it cannot iterate.
   */
  it('answers prototype member names with prompts, not with Object', () => {
    for (const screen of [
      '__proto__',
      'constructor',
      'toString',
      'valueOf',
      'hasOwnProperty'
    ]) {
      const prompts = fallbackFollowUps(screen);
      expect(Array.isArray(prompts)).toBe(true);
      expect(prompts).toEqual(fallbackFollowUps('dashboard'));
    }
  });

  /** Handed to an OnPush chip list, so the same screen has to mean the same array. */
  it('answers with one array per screen', () => {
    expect(fallbackFollowUps('client-detail')).toBe(fallbackFollowUps('client-detail'));
    expect(fallbackFollowUps('nowhere')).toBe(fallbackFollowUps('elsewhere'));
  });

  /** A fourth chip wraps to a second row on a narrow panel and buys nothing. */
  it('never offers more than three', () => {
    for (const screen of [
      'loan-detail',
      'client-detail',
      'client-list',
      'dashboard'
    ]) {
      expect(fallbackFollowUps(screen).length).toBeLessThanOrEqual(3);
    }
  });
});
