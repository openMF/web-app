/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'truncateText' })
export class TruncateTextPipe implements PipeTransform {
  transform(value: string, chars: number): string {
    if (value.length <= 40) {
      return value;
    }

    let truncatedText = value.substring(0, 30);
    if (chars) {
      truncatedText = value.substring(0, chars);
    }

    return truncatedText;
  }
}
