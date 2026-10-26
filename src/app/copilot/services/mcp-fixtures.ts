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
 * pacing so the full UI (tokens, cards, approval flow) works end to end.
 * Swapping to the real gateway is a configuration change only.
 *
 * The wording here is held to the same bar as production: accounts are named,
 * amounts carry their currency, no record id is shown to the officer, and
 * every string an officer reads comes from the translation files. A demo that
 * only speaks English would misrepresent a product that ships in thirteen
 * languages.
 */

/** Resolves a translation key, supplied by the caller so this module stays DI-free. */
export type Translator = (key: string, params?: Record<string, unknown>) => string;

const TOKEN_DELAY_MS = 18;

/** Stand-ins used when no client is in focus, so the demo still reads like a branch. */
const DEMO_CLIENT = 'Rajesh Kumar';
const DEMO_LOAN_ACCOUNT = '000000004521';
const DEMO_CLIENT_ACCOUNT = '000000000052';
const DEMO_CURRENCY = 'INR';

/**
 * The one date the demo runs on. Both the value sent for execution and the value shown on
 * the card derive from it, because a card that disagrees with what will execute is the
 * exact failure this feature exists to prevent, and a demo should not model that.
 */
const DEMO_DATE = new Date(Date.UTC(2026, 7, 21));

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

/**
 * How long a demo tool call appears to take.
 *
 * <p>Long enough that the live line is legible rather than a flicker, short enough that the
 * demo does not feel broken. The real gateway takes seconds on a tool call, so a demo that
 * returns instantly misrepresents the wait the reasoning block exists to explain.
 */
const STEP_DELAY_MS = 900;

/** Pause between working-note fragments as the model writes them. */
const NOTE_DELAY_MS = 12;

/**
 * A 'thinking' start → delta* → end sequence, the shape chat.service.ts reduces into
 * `workingNotes` + `notesElapsedMs`.
 */
async function* thinking(text: string): AsyncGenerator<McpStreamEvent> {
  const startedAt = Date.now();
  yield { type: 'thinking', thinkingPhase: 'start' };
  for (const word of text.match(/\S+\s*|\s+/g) ?? []) {
    await sleep(NOTE_DELAY_MS);
    yield { type: 'thinking', thinkingPhase: 'delta', thinking: word };
  }
  yield { type: 'thinking', thinkingPhase: 'end', thinkingElapsedMs: Date.now() - startedAt };
}

/**
 * One tool call, started → finished, carrying the banking `toolLabel` the manifest
 * supplies. Awaits between the two phases, so only ever one step is in flight —
 * which is what recordStep() in chat.service.ts assumes.
 */
async function* step(toolName: string, toolLabel: string, readOnly = true): AsyncGenerator<McpStreamEvent> {
  const startedAt = Date.now();
  yield { type: 'tool_call', toolName, toolLabel, toolPhase: 'started', readOnly };
  await sleep(STEP_DELAY_MS);
  yield {
    type: 'tool_call',
    toolName,
    toolLabel,
    toolPhase: 'finished',
    readOnly,
    durationMs: Date.now() - startedAt
  };
}

/** One-line helper so suggestion lists read clearly at each call site. */
function suggest(...items: string[]): McpStreamEvent {
  return { type: 'suggest', suggestions: items };
}

/** yyyy-MM-dd, the form a write tool takes. */
function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** "21 August 2026", the form an officer reads. */
function readableDate(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale || 'en', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(date);
}

/** Grouped thousands with the currency in front, matching what the gateway sends. */
function money(amount: number, locale: string): string {
  const formatted = new Intl.NumberFormat(locale || 'en', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
  return `${DEMO_CURRENCY} ${formatted}`;
}

/**
 * A card id that is unique even for two approvals raised in the same millisecond, and whose
 * tail varies so the reference shown on the card is not the same string every time.
 */
let cardSequence = 0;
function nextCardId(): string {
  cardSequence += 1;
  return `mock-card-${Date.now().toString(36)}-${cardSequence.toString(36).padStart(4, '0')}`;
}

/** A name is only a name once it has a non-blank value. */
function clientName(request: McpChatRequest): string {
  return request.context.clientName?.trim() || DEMO_CLIENT;
}

/** Streams a mock reply for a chat turn, selected by simple intent matching. */
export async function* mockChatStream(
  request: McpChatRequest,
  t: Translator,
  locale = 'en'
): AsyncGenerator<McpStreamEvent> {
  const message = request.message.toLowerCase();
  const client = clientName(request);
  const loanAccount = request.context.loanId ? String(request.context.loanId).padStart(12, '0') : DEMO_LOAN_ACCOUNT;
  const clientAccount = request.context.clientId
    ? String(request.context.clientId).padStart(12, '0')
    : DEMO_CLIENT_ACCOUNT;
  const product = t('copilot.demo.product');

  if (/(approve|disburse|repay|repayment|record|transfer|waive)/.test(message)) {
    // Write intent, so the gateway pauses with an approval card and nothing executes yet.
    yield* thinking(
      `This asks me to change a record, so nothing executes without the officer approving it. ` +
        `I will read the loan first so the card states the real figures rather than echoing ` +
        `back what was typed.`
    );
    yield* step('mifos_loan_details', 'Reading the loan account');
    yield* tokens(t('copilot.demo.writeIntro'));
    await sleep(120);
    yield {
      type: 'action_card',
      pendingAction: {
        cardId: nextCardId(),
        tool: 'mifos_loan_approve',
        args: {
          loanId: request.context.loanId ?? 4521,
          approvedLoanAmount: 25000,
          approvedOnDate: isoDate(DEMO_DATE)
        },
        // What the officer reads: the gateway looked the account up first. Every value
        // here is derived from the same source as the argument it stands for.
        display: [
          { label: 'Client', value: client },
          { label: 'Loan account', value: loanAccount },
          { label: 'Product', value: product },
          { label: 'Applied for', value: money(30000, locale) },
          { label: 'Approved amount', value: money(25000, locale) },
          { label: 'Approval date', value: readableDate(DEMO_DATE, locale) }
        ],
        humanSummary: t('copilot.demo.approveSummary', { product, client }),
        idempotencyKey: 'srv-mock-0001',
        expiresAt: new Date(Date.now() + 5 * 60_000).toISOString()
      }
    };
    return; // Stream pauses here; it resumes via the decision endpoint.
  }

  if (/loan/.test(message)) {
    yield* thinking(
      `The officer is asking about ${client}'s loan. I should find the client record first, ` +
        `then read the loan account itself, and check the repayment schedule before I say ` +
        `anything about what is outstanding. I will not quote a figure I have not read.`
    );
    yield* step('mifos_client_search', 'Finding the client');
    yield* step('mifos_loan_details', 'Reading the loan account');
    yield* step('mifos_repayment_schedule', 'Checking the repayment schedule');
    yield* tokens(t('copilot.demo.loanIntro', { client }));
    yield {
      type: 'action_card',
      card: {
        type: 'loan',
        title: t('copilot.demo.loanTitle', { product }),
        data: {
          // Keys are the shared card vocabulary; the card components translate them.
          'Loan account': loanAccount,
          Principal: money(50000, locale),
          Outstanding: money(31250, locale),
          'Next instalment': t('copilot.demo.nextInstalment', { amount: money(5000, locale), days: 2 }),
          Status: t('copilot.demo.statusActive')
        }
      }
    };
    yield suggest(
      t('copilot.demo.suggest.schedule'),
      t('copilot.demo.suggest.recordRepayment'),
      t('copilot.demo.suggest.overdue')
    );
    yield { type: 'done', conversationId: request.conversationId ?? 'mock-conv-1' };
    return;
  }

  if (/(client|search|who is)/.test(message)) {
    yield* thinking(
      `A client lookup. I will search the client register, then read the profile and the ` +
        `savings balance so the summary is complete rather than partly guessed.`
    );
    yield* step('mifos_client_search', 'Searching the client register');
    yield* step('mifos_client_details', 'Reading the client profile');
    yield* step('mifos_savings_balance', 'Reading the savings balance');
    yield* tokens(t('copilot.demo.clientIntro'));
    yield {
      type: 'action_card',
      card: {
        type: 'client',
        title: client,
        data: {
          'Client account': clientAccount,
          Office: t('copilot.demo.office'),
          Status: t('copilot.demo.statusActive'),
          'Active loans': '1',
          'Savings balance': money(12300, locale)
        }
      }
    };
    yield suggest(
      t('copilot.demo.suggest.theirLoans'),
      t('copilot.demo.suggest.kyc'),
      t('copilot.demo.suggest.savings')
    );
    yield { type: 'done', conversationId: request.conversationId ?? 'mock-conv-1' };
    return;
  }

  // The fallback answers with a trail too. Without one, any prompt outside the three intents
  // above showed no reasoning at all, which made the demo look like the feature was missing
  // rather than like the question had no account to read.
  yield* thinking(
    `Nothing in this asks for a specific loan or client by name, so I have no account to ` +
      `read. I will say what I can actually do rather than guess at what was meant.`
  );
  yield* step('mifos_client_search', 'Searching the client register');
  yield* tokens(t('copilot.demo.modeNotice'));
  yield suggest(
    t('copilot.demo.suggest.clientLoans'),
    t('copilot.demo.suggest.approve'),
    t('copilot.demo.suggest.searchClient')
  );
  yield { type: 'done', conversationId: request.conversationId ?? 'mock-conv-1' };
}

/** Streams the continuation of a paused turn after approve/reject. */
export async function* mockDecisionStream(
  cardId: string,
  decision: 'approve' | 'reject',
  t: Translator
): AsyncGenerator<McpStreamEvent> {
  await sleep(250);
  if (decision === 'approve') {
    yield* step('mifos_loan_approve', 'Approving the loan', false);
    yield* tokens(t('copilot.demo.approved'));
    yield {
      type: 'action_card',
      card: {
        type: 'insight',
        title: t('copilot.demo.approvedTitle'),
        data: {
          Status: t('copilot.demo.statusApproved'),
          // Take the varying tail: every demo card id starts "mock-card-".
          Reference: cardId.slice(-8).toUpperCase(),
          'Approved by': t('copilot.demo.approvedByYou')
        }
      }
    };
    yield suggest(
      t('copilot.demo.suggest.disburse'),
      t('copilot.demo.suggest.schedule'),
      t('copilot.demo.suggest.backToClient')
    );
  } else {
    yield* tokens(t('copilot.demo.cancelled'));
  }
  yield { type: 'done', conversationId: 'mock-conv-1' };
}
