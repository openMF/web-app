/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * What to offer next when a reply suggests nothing of its own.
 *
 * <p>Follow-up chips used to exist only when the model remembered to write a ```suggest```
 * block, which meant the row under an answer was there on one turn and gone on the next. An
 * officer reads that as the panel breaking rather than as the model declining to suggest
 * anything, and worse, asked about it directly it explains its own instructions back to them.
 * A control that comes and goes for reasons the officer cannot see is not a control.
 *
 * <p>So the chips fall back to a fixed set chosen by the screen the question was asked from.
 * Fixed is the point: these are translation keys, they read the same every time, and they
 * only ever offer something the panel can actually answer from where the officer is standing.
 * A model-written suggestion, when there is one, is still better — it knows what was just
 * discussed — so it always wins.
 */

/** Everything the panel can suggest, as translation keys. */
const CLIENT_DETAILS = 'copilot.suggestions.clientDetails';
const REPAYMENT_SCHEDULE = 'copilot.suggestions.repaymentSchedule';
const SAVINGS_BALANCE = 'copilot.suggestions.savingsBalance';
const OVERDUE_LOANS = 'copilot.suggestions.overdueLoans';

/**
 * Per screen, in the order they are shown.
 *
 * <p>Each list leaves out the question the officer is most likely to have just asked from
 * that screen: on a client page "show me this client's profile" is what got them there, and
 * offering it back is the panel not paying attention. Three is the ceiling, because a fourth
 * chip wraps to a second row on a narrow panel and buys nothing.
 */
const BY_SCREEN = new Map<string, string[]>([
  [
    'loan-detail',
    [
      REPAYMENT_SCHEDULE,
      CLIENT_DETAILS,
      SAVINGS_BALANCE
    ]
  ],
  [
    'client-detail',
    [
      SAVINGS_BALANCE,
      REPAYMENT_SCHEDULE,
      OVERDUE_LOANS
    ]
  ],
  [
    'client-list',
    [
      CLIENT_DETAILS,
      OVERDUE_LOANS
    ]
  ]
]);

/** Away from a client or a loan, only what holds anywhere. */
const ANYWHERE: string[] = [
  CLIENT_DETAILS,
  OVERDUE_LOANS
];

/**
 * Follow-ups for a reply that offered none, given the screen the question came from.
 *
 * <p>A Map rather than an object, because the screen name is not a literal this module chose.
 * It is the first segment of whatever route the officer is on, and the app answers an unknown
 * route by rendering "not found" at that URL rather than redirecting away from it — so a
 * screen of 'constructor' is one mistyped address away. Read off an object literal that name
 * finds Object through the prototype chain, and this function hands back a function with a
 * length of 1 where the caller's types promise a list of prompts. Map has no such chain and
 * cannot answer with anything that was not put in it.
 *
 * <p>Returns the same array reference for the same screen, so handing it to an OnPush chip
 * list does not count as a changed input on every check.
 */
export function fallbackFollowUps(screen: string | null | undefined): string[] {
  return BY_SCREEN.get(screen ?? '') ?? ANYWHERE;
}
