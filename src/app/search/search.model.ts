/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export interface SearchData {
  entityId: number;
  entityAccountNo: string;
  entityExternalId: string;
  entityName: string;
  entityType: string;
  parentId: number;
  parentName: string;
  entityStatus: EntityStatus;
  parentType: string;
  subEntityType: string;
}

export interface EntityStatus {
  id: number;
  code: string;
  value: string;
}
