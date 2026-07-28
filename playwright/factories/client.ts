/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * Layer 4 — Test data factories.
 *
 * Factories produce deterministic, framework-agnostic test payloads that
 * specs can hand straight to a page object helper (e.g. the create-client
 * stepper) without re-deriving suffixes, dates, or office names in every
 * spec. The pure {@link createTestClient} builder never touches the
 * network — pair it with `FineractApiClient` when API seeding is
 * required.
 *
 * The async {@link createSeededClient} factory bundles the pure payload
 * with a single API create call and (when requested) a follow-up
 * command that transitions the client to `active`, `rejected`,
 * `withdrawn`, or `closed`. It returns a {@link SeededTestClient} whose
 * `cleanup` closure knows how to tear the client down for the state it
 * created.
 *
 * Cross-framework portability: the pure return shape matches
 * `GeneralStepData` from the page-object barrel, which the React port
 * exports under the same name. Importing a factory from
 * `playwright/factories/...` therefore behaves identically against either
 * web app.
 */

import type { FineractApiClient } from '../fixtures/fineract-api';
import type { GeneralStepData } from '../pages';

/**
 * Stronger return type for {@link createTestClient}.
 *
 * The factory always populates `office`, `legalForm`, `firstname`,
 * `lastname`, and `submittedOnDate`, so specs can read those fields
 * without `!` non-null assertions or `?? ''` fall-backs. Optional
 * fields (`middlename`, `mobileNo`, `email`, …) remain optional so the
 * type stays interchangeable with the page-object's
 * `fillGeneralStep(data)` parameter.
 */
export type TestClientPayload = GeneralStepData &
  Required<Pick<GeneralStepData, 'office' | 'legalForm' | 'firstname' | 'lastname' | 'submittedOnDate'>>;

export type ClientState = 'pending' | 'active' | 'rejected' | 'withdrawn' | 'closed';

export interface CreateTestClientOverrides extends Partial<GeneralStepData> {
  state?: ClientState;
  actionDate?: string;
  rejectionReasonName?: string;
  withdrawalReasonName?: string;
  closureReasonName?: string;
}

export interface SeededTestClient {
  clientId: number;
  officeId: number;
  payload: TestClientPayload;
  state: ClientState;
  cleanup: () => Promise<void>;
}

const DEFAULT_TEST_CLIENT_DATA: Readonly<TestClientPayload> = {
  office: 'Head Office',
  legalForm: 'PERSON',
  firstname: 'Test',
  lastname: 'Client',
  submittedOnDate: '01 January 2024'
};

let testClientSequence = 0;
const MODULE_LOAD_EPOCH = Date.now();

function extractPayloadOverrides(overrides: CreateTestClientOverrides): Partial<GeneralStepData> {
  const { state, actionDate, rejectionReasonName, withdrawalReasonName, closureReasonName, ...payloadOverrides } =
    overrides;
  void state;
  void actionDate;
  void rejectionReasonName;
  void withdrawalReasonName;
  void closureReasonName;
  return payloadOverrides;
}

export function createTestClient(overrides: CreateTestClientOverrides = {}): TestClientPayload {
  testClientSequence += 1;
  const uniqueSuffix = `${MODULE_LOAD_EPOCH}${testClientSequence}`;
  const payloadOverrides = extractPayloadOverrides(overrides);

  return {
    ...DEFAULT_TEST_CLIENT_DATA,
    firstname: `${DEFAULT_TEST_CLIENT_DATA.firstname}${uniqueSuffix}`,
    ...payloadOverrides
  };
}

function resolveCreatedClientId(response: unknown): number {
  const candidate = response as { resourceId?: number; clientId?: number } | null | undefined;
  const id = candidate?.resourceId ?? candidate?.clientId;

  if (typeof id !== 'number') {
    throw new Error(
      `[createSeededClient] Fineract create-client response missing resourceId/clientId: ${JSON.stringify(response)}`
    );
  }

  return id;
}

export async function createSeededClient(
  fineractApi: FineractApiClient,
  overrides: CreateTestClientOverrides = {}
): Promise<SeededTestClient> {
  const payload = createTestClient(overrides);
  const state: ClientState = overrides.state ?? 'pending';
  const actionDate = overrides.actionDate ?? payload.submittedOnDate;
  const officeId = await fineractApi.getFirstOfficeId();

  const createResponse =
    state === 'active' || state === 'closed'
      ? await fineractApi.createActiveClient(officeId, {
          firstname: payload.firstname,
          lastname: payload.lastname,
          submittedOnDate: payload.submittedOnDate,
          activationDate: actionDate
        })
      : await fineractApi.createPendingClient(officeId, {
          firstname: payload.firstname,
          lastname: payload.lastname,
          submittedOnDate: payload.submittedOnDate
        });

  const clientId = resolveCreatedClientId(createResponse);

  const cleanup = async (): Promise<void> => {
    try {
      const members = await fineractApi.getClientFamilyMembers(clientId).catch(() => [] as unknown[]);

      for (const member of members) {
        const memberId = (member as { id?: number }).id;
        if (typeof memberId !== 'number') {
          continue;
        }

        try {
          await fineractApi.deleteClientFamilyMember(clientId, memberId);
        } catch (memberError) {
          const message = memberError instanceof Error ? memberError.message : String(memberError);
          console.warn(
            `[createSeededClient cleanup] failed to delete family member ${memberId} of client ${clientId}: ${message}`
          );
        }
      }

      await fineractApi.deleteClient(clientId);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`[createSeededClient cleanup] failed to delete client ${clientId} (state=${state}): ${message}`);
    }
  };

  try {
    switch (state) {
      case 'rejected': {
        const reason = await fineractApi.ensureClientRejectionReason(overrides.rejectionReasonName);
        await fineractApi.rejectClient(clientId, reason.id, actionDate);
        break;
      }
      case 'withdrawn': {
        const reason = await fineractApi.ensureClientWithdrawalReason(overrides.withdrawalReasonName);
        await fineractApi.withdrawClient(clientId, reason.id, actionDate);
        break;
      }
      case 'closed': {
        const reason = await fineractApi.ensureClientClosureReason(overrides.closureReasonName);
        await fineractApi.closeClient(clientId, reason.id, actionDate);
        break;
      }
      case 'pending':
      case 'active':
        break;
    }
  } catch (transitionError) {
    await cleanup();
    throw transitionError;
  }

  return { clientId, officeId, payload, state, cleanup };
}
