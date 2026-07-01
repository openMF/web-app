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
 * spec. They never touch the network — pair them with `FineractApiClient`
 * when API seeding is required.
 *
 * Cross-framework portability: the returned shape matches
 * `GeneralStepData` from the page-object barrel, which the React port
 * exports under the same name. Importing a factory from
 * `playwright/factories/...` therefore behaves identically against either
 * web app.
 */

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
 *
 * Overrides that explicitly set one of these fields to `''` (the empty
 * string) still satisfy `string`, which is precisely how negative-path
 * specs request an empty required field without bypassing the type
 * system.
 */
export type TestClientPayload = GeneralStepData &
  Required<Pick<GeneralStepData, 'office' | 'legalForm' | 'firstname' | 'lastname' | 'submittedOnDate'>>;

/**
 * Default values used by {@link createTestClient}.
 *
 * Aligned with the Fineract default-tenant Liquibase seed:
 *   - `Head Office` is the first row inserted into `m_office`.
 *   - PERSON (legalFormId = 1) is the most common legal form and matches
 *     the seeded `c_code_value`s used by other Playwright specs.
 *   - `01 January 2024` is the same submitted-on date the close-client
 *     spec uses, keeping all test clients clustered on a known business
 *     day so reports stay readable.
 */
const DEFAULT_TEST_CLIENT_DATA: Readonly<TestClientPayload> = {
  office: 'Head Office',
  legalForm: 'PERSON',
  firstname: 'Test',
  lastname: 'Client',
  submittedOnDate: '01 January 2024'
};

/**
 * Monotonic counter used to keep firstnames unique even when the same
 * test invokes `createTestClient` multiple times within a single
 * millisecond. Combined with the module-load epoch it produces
 * `Test<epoch><seq>` style names that satisfy Fineract's
 * "must not begin with a number" pattern (the leading `Test` prefix is
 * always alphabetic).
 */
let testClientSequence = 0;
const MODULE_LOAD_EPOCH = Date.now();

/**
 * Builds a deterministic, uniquely-named payload for the create-client
 * stepper.
 *
 * Use this factory in negative-path specs that need a valid baseline to
 * mutate one field at a time — e.g. clearing `lastname` to assert the
 * Person-legal-form validator surfaces "Client last name is required".
 *
 * The happy-path spec intentionally avoids this factory and inlines the
 * payload so the UI form, the API echo assertion, and the cleanup-guard
 * all read against the same explicit values.
 *
 * @param overrides - Partial overrides merged on top of the defaults.
 *                    Pass `lastname: ''` (or any other empty required
 *                    field) to exercise validation.
 * @returns A {@link TestClientPayload} ready for
 *          `CreateClientPage.fillGeneralStep`.
 */
export function createTestClient(overrides: Partial<GeneralStepData> = {}): TestClientPayload {
  testClientSequence += 1;
  const uniqueSuffix = `${MODULE_LOAD_EPOCH}${testClientSequence}`;

  return {
    ...DEFAULT_TEST_CLIENT_DATA,
    firstname: `${DEFAULT_TEST_CLIENT_DATA.firstname}${uniqueSuffix}`,
    ...overrides
  };
}
