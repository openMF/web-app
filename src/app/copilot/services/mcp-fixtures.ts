/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { McpChatRequest, McpStreamEvent } from '../core/models/mcp-response.model';

/**
 * Mock transport used while the Copilot gateway is not deployed
 * (copilotMcpBaseUrl = 'mock'). Streams contract-v1 events with realistic
 * pacing so the full UI — tokens, cards, approval flow — works end to end.
 * Swapping to the real gateway is a configuration change only.
 */

const TOKEN_DELAY_MS = 18;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function* tokens(text: string): AsyncGenerator<McpStreamEvent> {
  // Split after each whitespace run without a lookbehind, which Safari below 16.4
  // rejects at parse time (the project's browserslist still includes those versions).
  for (const word of text.match(/\S+\s*|\s+/g) ?? []) {
    await sleep(TOKEN_DELAY_MS);
    yield { type: 'token', token: word };
  }
}

/** One-line helper so suggestion lists read clearly at each call site. */
function suggest(...items: string[]): McpStreamEvent {
  return { type: 'suggest', suggestions: items };
}

/** Streams a mock reply for a chat turn, selected by simple intent matching. */
export async function* mockChatStream(request: McpChatRequest): AsyncGenerator<McpStreamEvent> {
  const message = request.message.toLowerCase();
  const clientLabel =
    request.context.clientName ?? (request.context.clientId ? `client #${request.context.clientId}` : null);

  if (/(approve|disburse|repay|repayment|record|transfer|waive)/.test(message)) {
    // Write intent -> the gateway pauses with an approval card; nothing executes yet.
    yield* tokens('I can do that. Please review and confirm the action below before I execute it.\n');
    await sleep(120);
    yield {
      type: 'action_card',
      pendingAction: {
        cardId: `mock-card-${Date.now()}`,
        tool: 'fineract_loan_approve',
        args: {
          loanId: request.context.loanId ?? 4521,
          approvedAmount: 25000,
          client: clientLabel ?? 'Rajesh Kumar'
        },
        humanSummary: `Approve loan #${request.context.loanId ?? 4521} for ${clientLabel ?? 'Rajesh Kumar'} (₹25,000)`,
        idempotencyKey: 'srv-mock-0001',
        expiresAt: new Date(Date.now() + 5 * 60_000).toISOString()
      }
    };
    return; // Stream pauses here; it resumes via the decision endpoint.
  }

  if (/loan/.test(message)) {
    yield { type: 'tool_call', toolName: 'fineract_loan_details', toolPhase: 'started', readOnly: true };
    await sleep(350);
    yield { type: 'tool_call', toolName: 'fineract_loan_details', toolPhase: 'finished', readOnly: true };
    yield* tokens(`Here is the active loan${clientLabel ? ` for **${clientLabel}**` : ''}:\n`);
    yield {
      type: 'action_card',
      card: {
        type: 'loan',
        title: `Loan #${request.context.loanId ?? 4521} — Active`,
        data: {
          Product: 'Agriculture Term Loan',
          Principal: '₹50,000',
          Outstanding: '₹31,250',
          'Next EMI': '₹5,000 due in 2 days',
          Status: 'Active'
        }
      }
    };
    yield suggest('Show repayment schedule', 'Record a repayment', 'Show overdue loans');
    yield { type: 'done', conversationId: request.conversationId ?? 'mock-conv-1' };
    return;
  }

  if (/(client|search|who is)/.test(message)) {
    yield { type: 'tool_call', toolName: 'fineract_client_search', toolPhase: 'started', readOnly: true };
    await sleep(300);
    yield { type: 'tool_call', toolName: 'fineract_client_search', toolPhase: 'finished', readOnly: true };
    yield* tokens('I found this client:\n');
    yield {
      type: 'action_card',
      card: {
        type: 'client',
        title: clientLabel ?? 'Rajesh Kumar',
        data: {
          'Client ID': String(request.context.clientId ?? 4521),
          Office: 'Head Office',
          Status: 'Active',
          'Active loans': '1',
          'Savings balance': '₹12,300'
        }
      }
    };
    yield suggest('Show their loans', 'Show KYC documents', 'Check savings balance');
    yield { type: 'done', conversationId: request.conversationId ?? 'mock-conv-1' };
    return;
  }

  yield* tokens(
    'I am running in **mock mode** (no gateway connected yet), but the full pipeline you are ' +
      'seeing — streaming, cards, confirmations — is the real one. Try “show loans for this client” ' +
      'or “approve this loan”.'
  );
  yield suggest('Show loans for this client', 'Approve this loan', 'Search client Rajesh');
  yield { type: 'done', conversationId: request.conversationId ?? 'mock-conv-1' };
}

/** Streams the continuation of a paused turn after approve/reject. */
export async function* mockDecisionStream(
  cardId: string,
  decision: 'approve' | 'reject'
): AsyncGenerator<McpStreamEvent> {
  await sleep(250);
  if (decision === 'approve') {
    yield { type: 'tool_call', toolName: 'fineract_loan_approve', toolPhase: 'started', readOnly: false };
    await sleep(600);
    yield { type: 'tool_call', toolName: 'fineract_loan_approve', toolPhase: 'finished', readOnly: false };
    yield* tokens('Done — the loan has been approved and recorded in the audit trail.\n');
    yield {
      type: 'action_card',
      card: {
        type: 'insight',
        title: 'Loan approved',
        data: {
          Status: 'Approved',
          'Audit reference': cardId,
          'Executed as': 'your user (Fineract RBAC applied)'
        }
      }
    };
    yield suggest('Disburse this loan', 'Show the repayment schedule', 'Back to client profile');
  } else {
    yield* tokens('Understood — I cancelled the action. Nothing was executed.');
  }
  yield { type: 'done', conversationId: 'mock-conv-1' };
}
