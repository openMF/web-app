/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { test, expect } from '@playwright/test';

import type { FineractApiClient } from '../fixtures/fineract-api';
import {
  createSeededClient,
  createTestClient,
  type ClientState,
  type CreateTestClientOverrides,
  type SeededTestClient
} from './client';

// Pure-logic specs — they run under the `unit` Playwright project
// (testMatch: /playwright\/(utils|factories)\/.*\.spec\.ts/ in
// playwright.config.ts) with no browser, no app, no backend. The
// `FineractApiClient` is stubbed so the assertions can inspect the
// exact command sequence the factory drives without ever making an
// HTTP call.
test.use({ storageState: { cookies: [], origins: [] } });

// ─────────────────────────────────────────────────────────────────────
// createTestClient — pure payload synthesis
// ─────────────────────────────────────────────────────────────────────

test.describe('createTestClient() payload synthesis', () => {
  test('populates every required GeneralStepData field with the seeded defaults', () => {
    const payload = createTestClient();
    expect(payload.office).toBe('Head Office');
    expect(payload.legalForm).toBe('PERSON');
    expect(payload.lastname).toBe('Client');
    expect(payload.submittedOnDate).toBe('01 January 2024');
    // firstname is monotonically suffixed — assert on the prefix
    // rather than the full value so test order does not matter.
    expect(payload.firstname).toMatch(/^Test\d+$/);
  });

  test('produces a unique firstname on every invocation within the same process', () => {
    const a = createTestClient();
    const b = createTestClient();
    const c = createTestClient();
    expect(a.firstname).not.toBe(b.firstname);
    expect(b.firstname).not.toBe(c.firstname);
    expect(a.firstname).not.toBe(c.firstname);
  });

  test('overrides win over the defaults for payload-relevant fields', () => {
    const payload = createTestClient({
      office: 'Branch 42',
      lastname: '',
      submittedOnDate: '15 March 2024'
    });
    expect(payload.office).toBe('Branch 42');
    expect(payload.lastname).toBe('');
    expect(payload.submittedOnDate).toBe('15 March 2024');
  });

  test('strips seeded-factory-only fields (state, actionDate, reasons) from the returned payload', () => {
    // The pure builder must not leak the seeded-factory keys into
    // the payload it returns — they would be rejected by
    // `CreateClientPage.fillGeneralStep` (or worse: silently sent
    // to Fineract as unknown fields).
    const payload = createTestClient({
      state: 'closed',
      actionDate: '05 January 2024',
      rejectionReasonName: 'ignored',
      withdrawalReasonName: 'ignored',
      closureReasonName: 'ignored'
    } satisfies CreateTestClientOverrides);
    const bag = payload as unknown as Record<string, unknown>;
    expect(bag.state).toBeUndefined();
    expect(bag.actionDate).toBeUndefined();
    expect(bag.rejectionReasonName).toBeUndefined();
    expect(bag.withdrawalReasonName).toBeUndefined();
    expect(bag.closureReasonName).toBeUndefined();
    // Sanity: the defaults are still present.
    expect(payload.office).toBe('Head Office');
    expect(payload.legalForm).toBe('PERSON');
  });
});

// ─────────────────────────────────────────────────────────────────────
// Stub FineractApiClient
// ─────────────────────────────────────────────────────────────────────

/**
 * Signature-compatible stand-in for {@link FineractApiClient} that
 * records every method invocation the factory drives. The stub only
 * implements the subset of methods that `createSeededClient` touches
 * — the rest are typed away via a single `as unknown as` cast so
 * TypeScript still enforces the shape at the call sites we care
 * about.
 */
interface StubCall {
  method: string;
  args: unknown[];
}

function buildStub(overrides?: {
  createResourceId?: number;
  familyMembers?: Array<{ id: number }>;
  deleteClientThrows?: Error;
}): {
  api: FineractApiClient;
  calls: StubCall[];
} {
  const calls: StubCall[] = [];
  const record = (method: string, args: unknown[]): void => {
    calls.push({ method, args });
  };
  const createdId = overrides?.createResourceId ?? 42;

  const stub = {
    getFirstOfficeId: async (): Promise<number> => {
      record('getFirstOfficeId', []);
      return 7;
    },
    createActiveClient: async (officeId: number, data: Record<string, unknown>): Promise<{ resourceId: number }> => {
      record('createActiveClient', [
        officeId,
        data
      ]);
      return { resourceId: createdId };
    },
    createPendingClient: async (officeId: number, data: Record<string, unknown>): Promise<{ resourceId: number }> => {
      record('createPendingClient', [
        officeId,
        data
      ]);
      return { resourceId: createdId };
    },
    ensureClientClosureReason: async (name?: string): Promise<{ id: number; name: string }> => {
      record('ensureClientClosureReason', [name]);
      return { id: 101, name: name ?? 'default-closure' };
    },
    ensureClientRejectionReason: async (name?: string): Promise<{ id: number; name: string }> => {
      record('ensureClientRejectionReason', [name]);
      return { id: 202, name: name ?? 'default-reject' };
    },
    ensureClientWithdrawalReason: async (name?: string): Promise<{ id: number; name: string }> => {
      record('ensureClientWithdrawalReason', [name]);
      return { id: 303, name: name ?? 'default-withdraw' };
    },
    closeClient: async (clientId: number, reasonId: number, date: string): Promise<unknown> => {
      record('closeClient', [
        clientId,
        reasonId,
        date
      ]);
      return {};
    },
    rejectClient: async (clientId: number, reasonId: number, date: string): Promise<unknown> => {
      record('rejectClient', [
        clientId,
        reasonId,
        date
      ]);
      return {};
    },
    withdrawClient: async (clientId: number, reasonId: number, date: string): Promise<unknown> => {
      record('withdrawClient', [
        clientId,
        reasonId,
        date
      ]);
      return {};
    },
    getClientFamilyMembers: async (clientId: number): Promise<Array<{ id: number }>> => {
      record('getClientFamilyMembers', [clientId]);
      return overrides?.familyMembers ?? [];
    },
    deleteClientFamilyMember: async (clientId: number, memberId: number): Promise<void> => {
      record('deleteClientFamilyMember', [
        clientId,
        memberId
      ]);
    },
    deleteClient: async (clientId: number): Promise<void> => {
      record('deleteClient', [clientId]);
      if (overrides?.deleteClientThrows) {
        throw overrides.deleteClientThrows;
      }
    }
  } as unknown as FineractApiClient;

  return { api: stub, calls };
}

/** Extracts the sequence of method names from a stub-call log. */
function methodNames(calls: StubCall[]): string[] {
  return calls.map((call) => call.method);
}

// ─────────────────────────────────────────────────────────────────────
// createSeededClient — state → command mapping
// ─────────────────────────────────────────────────────────────────────

test.describe('createSeededClient() state → command mapping', () => {
  test('defaults to pending: single POST /clients (active=false), no follow-up command', async () => {
    const { api, calls } = buildStub();
    const seeded = await createSeededClient(api);

    expect(seeded.state).toBe('pending');
    expect(seeded.clientId).toBe(42);
    expect(seeded.officeId).toBe(7);
    expect(methodNames(calls)).toEqual([
      'getFirstOfficeId',
      'createPendingClient'
    ]);
  });

  test('state: "active" uses createActiveClient with the payload activationDate', async () => {
    const { api, calls } = buildStub();
    const seeded = await createSeededClient(api, { state: 'active', actionDate: '10 February 2024' });

    expect(seeded.state).toBe('active');
    expect(methodNames(calls)).toEqual([
      'getFirstOfficeId',
      'createActiveClient'
    ]);
    const createArgs = calls[1].args[1] as { activationDate: string };
    expect(createArgs.activationDate).toBe('10 February 2024');
  });

  test('state: "rejected" seeds a pending client and drives command=reject with the ensured reason id', async () => {
    const { api, calls } = buildStub();
    const seeded = await createSeededClient(api, {
      state: 'rejected',
      actionDate: '11 February 2024',
      rejectionReasonName: 'Custom Reject Reason'
    });

    expect(seeded.state).toBe('rejected');
    expect(methodNames(calls)).toEqual([
      'getFirstOfficeId',
      'createPendingClient',
      'ensureClientRejectionReason',
      'rejectClient'
    ]);
    expect(calls[2].args).toEqual(['Custom Reject Reason']);
    // rejectClient(clientId, reasonId, date)
    expect(calls[3].args).toEqual([
      42,
      202,
      '11 February 2024'
    ]);
  });

  test('state: "withdrawn" seeds a pending client and drives command=withdraw with the ensured reason id', async () => {
    const { api, calls } = buildStub();
    const seeded = await createSeededClient(api, { state: 'withdrawn', actionDate: '12 February 2024' });

    expect(seeded.state).toBe('withdrawn');
    expect(methodNames(calls)).toEqual([
      'getFirstOfficeId',
      'createPendingClient',
      'ensureClientWithdrawalReason',
      'withdrawClient'
    ]);
    // No custom name → the ensure* call is invoked with `undefined`
    // so it falls through to the FineractApiClient default.
    expect(calls[2].args).toEqual([undefined]);
    expect(calls[3].args).toEqual([
      42,
      303,
      '12 February 2024'
    ]);
  });

  test('state: "closed" seeds an active client first, then drives command=close', async () => {
    const { api, calls } = buildStub();
    const seeded = await createSeededClient(api, { state: 'closed', actionDate: '13 February 2024' });

    expect(seeded.state).toBe('closed');
    expect(methodNames(calls)).toEqual([
      'getFirstOfficeId',
      'createActiveClient',
      'ensureClientClosureReason',
      'closeClient'
    ]);
    expect(calls[3].args).toEqual([
      42,
      101,
      '13 February 2024'
    ]);
  });

  test('actionDate falls back to the payload submittedOnDate when not provided', async () => {
    const { api, calls } = buildStub();
    await createSeededClient(api, {
      state: 'rejected',
      submittedOnDate: '01 January 2024'
    });

    // rejectClient's third argument is the effective actionDate.
    const rejectCall = calls.find((call) => call.method === 'rejectClient');
    expect(rejectCall).toBeDefined();
    expect((rejectCall as StubCall).args[2]).toBe('01 January 2024');
  });

  test('throws a clear error when the create response has neither resourceId nor clientId', async () => {
    const noIdStub = {
      getFirstOfficeId: async (): Promise<number> => 7,
      createPendingClient: async (): Promise<Record<string, unknown>> => ({})
    } as unknown as FineractApiClient;

    await expect(createSeededClient(noIdStub)).rejects.toThrow(/missing resourceId\/clientId/);
  });
});

// ─────────────────────────────────────────────────────────────────────
// createSeededClient — cleanup deleter
// ─────────────────────────────────────────────────────────────────────

test.describe('createSeededClient() cleanup deleter', () => {
  test('pending: purges family members (FK-safe order) then hard-deletes the client', async () => {
    const { api, calls } = buildStub({ familyMembers: [
        { id: 501 },
        { id: 502 }
      ] });
    const seeded = await createSeededClient(api);

    // Snapshot the call log up to seeding so cleanup asserts only
    // its own operations.
    const seedCallCount = calls.length;
    await seeded.cleanup();

    const cleanupCalls = calls.slice(seedCallCount);
    expect(methodNames(cleanupCalls)).toEqual([
      'getClientFamilyMembers',
      'deleteClientFamilyMember',
      'deleteClientFamilyMember',
      'deleteClient'
    ]);
    expect(cleanupCalls[1].args).toEqual([
      42,
      501
    ]);
    expect(cleanupCalls[2].args).toEqual([
      42,
      502
    ]);
    expect(cleanupCalls[3].args).toEqual([42]);
  });

  test('non-pending: swallows the deleteClient error (best-effort) and does not re-throw', async () => {
    // Fineract refuses hard deletion of clients not in Pending state.
    // The cleanup closure must catch that and continue — the test
    // asserts nothing is thrown to the caller.
    const { api } = buildStub({
      deleteClientThrows: new Error('403 Forbidden: client cannot be deleted in Closed state')
    });
    const seeded = await createSeededClient(api, { state: 'closed' });

    await expect(seeded.cleanup()).resolves.toBeUndefined();
  });

  test('cleanup is safe to call when the family-members endpoint itself rejects', async () => {
    // getClientFamilyMembers uses `.catch(() => [])` so a failure
    // fetching members degrades to "no members" and proceeds to the
    // delete step. Assert the cleanup still resolves.
    const failingStub = {
      getFirstOfficeId: async (): Promise<number> => 7,
      createPendingClient: async (): Promise<{ resourceId: number }> => ({ resourceId: 99 }),
      getClientFamilyMembers: async (): Promise<never> => {
        throw new Error('boom');
      },
      deleteClient: async (): Promise<void> => undefined
    } as unknown as FineractApiClient;

    const seeded = await createSeededClient(failingStub);
    await expect(seeded.cleanup()).resolves.toBeUndefined();
  });
});

// ─────────────────────────────────────────────────────────────────────
// Type-level guard: SeededTestClient carries the requested state
// ─────────────────────────────────────────────────────────────────────

test.describe('createSeededClient() return shape', () => {
  test('SeededTestClient.state echoes the requested ClientState value', async () => {
    const states: ClientState[] = [
      'pending',
      'active',
      'rejected',
      'withdrawn',
      'closed'
    ];
    for (const state of states) {
      const { api } = buildStub();
      const seeded: SeededTestClient = await createSeededClient(api, { state });
      expect(seeded.state).toBe(state);
    }
  });

  test('SeededTestClient exposes officeId and payload for API-echo assertions', async () => {
    const { api } = buildStub();
    const seeded = await createSeededClient(api, { firstname: 'SeededOverride' });
    expect(seeded.officeId).toBe(7);
    expect(seeded.payload.firstname).toBe('SeededOverride');
    // The payload should be a strict GeneralStepData shape — no
    // seeded-factory fields leaked into it.
    expect((seeded.payload as unknown as Record<string, unknown>).state).toBeUndefined();
  });
});
