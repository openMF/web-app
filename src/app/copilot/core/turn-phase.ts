/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { McpStreamEvent } from './models/mcp-response.model';

/**
 * Where a turn has got to, as one value rather than a handful of booleans.
 *
 * <p>The panel used to ask two separate questions to decide what to draw: is a turn running,
 * and does the draft have any text in it yet. Two indicators each answered one of them, so
 * both were on screen together for as long as the gap between them lasted. Against a hosted
 * model that gap is about a second and nobody saw it; against a local one that reasons before
 * it answers it is the better part of a minute, and the panel showed a typing animation and a
 * thinking animation at the same time for all of it.
 *
 * <p>One value, so exactly one indicator can be right at a time.
 */
export type CopilotTurnPhase =
  /** Nothing in flight. */
  | 'idle'
  /** Asked, and nothing of the answer has arrived yet. */
  | 'thinking'
  /** The answer is arriving. */
  | 'streaming'
  /** Stopped at a write the officer has to approve. */
  | 'awaitingApproval'
  /** The turn ended badly, and the reply says how. */
  | 'error';

/**
 * The phase a turn is in after `event`, given the phase it was in before.
 *
 * <p>Pure and total, so the progression is one readable table rather than assignments spread
 * through the event handler. Anything that does not move the turn on leaves it where it was.
 */
export function nextTurnPhase(current: CopilotTurnPhase, event: McpStreamEvent): CopilotTurnPhase {
  // A failed turn stays failed. Gateways commonly flush a trailing 'done' after an 'error',
  // and letting that read as an ordinary finish would clear the error state off the screen.
  if (current === 'error') {
    return 'error';
  }

  switch (event.type) {
    case 'token':
      // Whitespace-only tokens do not count as the answer arriving. Streaming runtimes send
      // them as keep-alives, and treating one as the first token would start the streaming
      // state over an empty bubble: the very flicker this type exists to remove.
      return event.token?.trim() ? 'streaming' : current;

    case 'thinking':
      // Only meaningful before the answer starts. A model that keeps narrating to itself
      // while it answers must not pull the panel back into a loading state.
      return current === 'thinking' ? 'thinking' : current;

    case 'action_card':
      return event.pendingAction ? 'awaitingApproval' : current;

    case 'error':
      return 'error';

    // A tool call says the turn is alive, not that it has moved on: a read mid-answer is
    // still the answer arriving. 'suggest' and 'done' are handled by the caller, which knows
    // whether the stream is finishing or merely being annotated.
    case 'tool_call':
    case 'suggest':
    case 'done':
    default:
      return current;
  }
}

/** Whether the turn is still running, which is what re-entrancy guards actually mean. */
export function isTurnActive(phase: CopilotTurnPhase): boolean {
  return phase === 'thinking' || phase === 'streaming';
}
