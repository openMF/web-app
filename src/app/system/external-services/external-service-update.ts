/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * Properties that `GET /externalservice/{name}` returns masked (for example `s****rt81`).
 * Fineract stores whatever `PUT /externalservice/{name}` sends, so these must never be sent back
 * as loaded: an edit form starts them empty, and they are sent only when a new value is typed.
 */
export const MASKED_EXTERNAL_SERVICE_PROPERTIES = {
  SMTP: ['password'],
  NOTIFICATION: ['server_key']
};

/**
 * Builds the `PUT /externalservice/{name}` body from an edit form.
 *
 * Fineract updates only the properties present in the body, so an unchanged property is left out,
 * and a masked property is sent only when one was typed: leaving it out keeps the stored value.
 * @param {object} initialValue Form value as it was loaded.
 * @param {object} currentValue Form value on submit.
 * @param {string[]} maskedProperties Properties Fineract returns masked.
 * @returns {object} The changed properties.
 */
export function buildExternalServiceUpdate(
  initialValue: Record<string, unknown>,
  currentValue: Record<string, unknown>,
  maskedProperties: string[]
): Record<string, unknown> {
  const update: Record<string, unknown> = {};
  Object.keys(currentValue).forEach((name: string) => {
    const value = currentValue[name];
    if (maskedProperties.includes(name)) {
      if (value) {
        update[name] = value;
      }
    } else if (value !== initialValue[name]) {
      update[name] = value;
    }
  });
  return update;
}
