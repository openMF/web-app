/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CreateHoliday {
  setEmptyObjectsToNull(root: any) {
    Object.keys(root).forEach((key) => {
      if (Object.keys(root[key]).length === 0) {
        root[key] = null;
      } else {
        this.setEmptyObjectsToNull(root[key]);
      }
    });
  }
}
