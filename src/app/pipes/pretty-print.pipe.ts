/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Pipe, PipeTransform } from '@angular/core';
import * as vkbeautify from 'vkbeautify';

@Pipe({ name: 'prettyPrint' })
export class PrettyPrintPipe implements PipeTransform {
  transform(value: any) {
    if (value.charAt(0) === '{' && value.charAt(value.length - 1) === '}') {
      try {
        return vkbeautify.json(value);
      } catch (error) {
        return value;
      }
    }
    return value;
  }
}
