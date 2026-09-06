/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { describe, it, expect } from '@jest/globals';
import { McpStreamEvent } from './models/mcp-response.model';
import { CopilotTurnPhase, isTurnActive, nextTurnPhase } from './turn-phase';

const event = (partial: Partial<McpStreamEvent> & Pick<McpStreamEvent, 'type'>): McpStreamEvent => partial;

describe('nextTurnPhase', () => {
  it('holds a fresh turn in thinking until something of the answer arrives', () => {
    let phase: CopilotTurnPhase = 'thinking';
    phase = nextTurnPhase(phase, event({ type: 'thinking', thinkingPhase: 'start' }));
    phase = nextTurnPhase(phase, event({ type: 'thinking', thinkingPhase: 'delta', thinking: 'Checking the loan.' }));
    phase = nextTurnPhase(phase, event({ type: 'tool_call', toolName: 'get_loan', toolPhase: 'started' }));
    expect(phase).toBe('thinking');
  });

  it('moves to streaming on the first token with text in it', () => {
    expect(nextTurnPhase('thinking', event({ type: 'token', token: 'The' }))).toBe('streaming');
  });

  /**
   * The bug this whole type exists for. A runtime that reasons before it answers keeps the
   * connection alive with empty frames, and reading one as the answer starting would flip the
   * panel into streaming over an empty bubble, then straight back when the real text landed.
   */
  it('does not mistake a whitespace keep-alive for the answer starting', () => {
    expect(nextTurnPhase('thinking', event({ type: 'token', token: '' }))).toBe('thinking');
    expect(nextTurnPhase('thinking', event({ type: 'token', token: '   \n' }))).toBe('thinking');
    expect(nextTurnPhase('thinking', event({ type: 'token' }))).toBe('thinking');
  });

  it('never falls back to thinking once the answer is arriving', () => {
    let phase: CopilotTurnPhase = 'streaming';
    phase = nextTurnPhase(phase, event({ type: 'thinking', thinkingPhase: 'delta', thinking: 'still working' }));
    expect(phase).toBe('streaming');
    phase = nextTurnPhase(phase, event({ type: 'tool_call', toolName: 'get_schedule', toolPhase: 'started' }));
    expect(phase).toBe('streaming');
  });

  it('stops at a write that needs approving', () => {
    const card = event({
      type: 'action_card',
      pendingAction: {
        cardId: 'c-1',
        tool: 'repay_loan',
        args: {},
        display: [],
        humanSummary: 'Post a repayment of 500.'
      }
    });
    expect(nextTurnPhase('thinking', card)).toBe('awaitingApproval');
  });

  it('leaves the phase alone for a card that only displays data', () => {
    const card = event({
      type: 'action_card',
      card: { type: 'loan', title: 'Loan 42', data: {} }
    });
    expect(nextTurnPhase('streaming', card)).toBe('streaming');
  });

  it('goes to error and stays there, even if the gateway flushes a trailing done', () => {
    const failed = nextTurnPhase('streaming', event({ type: 'error', errorCode: 'LLM_UNAVAILABLE' }));
    expect(failed).toBe('error');
    expect(nextTurnPhase(failed, event({ type: 'done', conversationId: 'w-1' }))).toBe('error');
    expect(nextTurnPhase(failed, event({ type: 'token', token: 'anything' }))).toBe('error');
  });
});

describe('isTurnActive', () => {
  it('counts only the phases where something is still coming', () => {
    expect(isTurnActive('thinking')).toBe(true);
    expect(isTurnActive('streaming')).toBe(true);
    expect(isTurnActive('idle')).toBe(false);
    expect(isTurnActive('awaitingApproval')).toBe(false);
    expect(isTurnActive('error')).toBe(false);
  });
});
