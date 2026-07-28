/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Pipe, PipeTransform } from '@angular/core';

export function formatDatatableDisplayLabel(label: unknown): string {
  if (label === null || typeof label === 'undefined') {
    return '';
  }

  const formattedLabel = String(label).replace(/_/g, ' ').toLowerCase();
  return formattedLabel.charAt(0).toUpperCase() + formattedLabel.slice(1);
}

@Pipe({ name: 'datatableDisplayLabel' })
export class DatatableDisplayLabelPipe implements PipeTransform {
  transform(value: unknown): string {
    return formatDatatableDisplayLabel(value);
  }
}
