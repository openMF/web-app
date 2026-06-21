/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * Context the Copilot silently attaches to every request.
 * Built automatically from the Angular Router, client-service state, and the JWT.
 * The user never types any of this.
 */
export interface CopilotContext {
  /** Client currently in focus, or null on list/dashboard views. */
  clientId: number | null;
  /** Display name of the focused client, when known. */
  clientName: string | null;
  /** Loan currently in focus, or null. */
  loanId: number | null;
  /** Logical screen name, e.g. 'client-detail', 'client-list', 'dashboard'. */
  screen: string;
  /** Username decoded from the JWT. */
  loggedInUser: string;
  /** Role decoded from the JWT, used for permission checks. */
  role: string;
  /** Two-letter language code ('en', 'es', 'sw', ...) for AI responses. */
  language: string;
}
