/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * Legal Form IDs for client types.
 * These represent the different legal forms a client can have.
 */
export enum LegalFormId {
  /** Individual/Personal client */
  PERSON = 1,
  /** Non-person/Entity client (Organization, Corporation, etc.) */
  ENTITY = 2
}
