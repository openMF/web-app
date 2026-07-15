/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * Layer 3 — Page Object barrel.
 *
 * Re-exports every concrete page object so specs can import them
 * through a single, stable entry point:
 *
 *     import { ClientsListPage, CreateClientPage } from '../pages';
 *
 * The barrel keeps spec files insulated from page-object file moves
 * and lets the React counterpart export an identically-shaped module
 * — making the cross-framework portability swap a path-only change.
 *
 * Re-exporting the supporting types (e.g. `GeneralStepData`) lets
 * specs build typed payloads without reaching into individual page
 * object files.
 */

export { BasePage } from './BasePage';
export { LoginPage } from './login.page';
export { ClientsListPage } from './clients-list.page';
export {
  CreateClientPage,
  type LegalForm,
  type GeneralStepData,
  type FamilyMemberData,
  type AddressData
} from './create-client.page';
export { ClientViewPage } from './client-view.page';
export { CloseClientPage } from './close-client.page';
