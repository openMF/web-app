/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { MissingTranslationHandler, MissingTranslationHandlerParams } from '@ngx-translate/core';

/**
 * Falls back to the untranslated string for the `labels.catalogs` namespace.
 *
 * That namespace is keyed by Fineract's own enum values, so a key it does not carry is a value the
 * backend named — a tenant's currency or delinquency bucket, a strategy the deployment added. Those
 * have no translation to find, and the value itself is the right thing to show. Every other
 * namespace falls through unchanged, so a genuinely missing key still surfaces as a visible key
 * rather than being papered over.
 */
export class CustomMissingTranslationHandler implements MissingTranslationHandler {
  handle(params: MissingTranslationHandlerParams): string {
    return params.key.replace('labels.catalogs.', '');
  }
}
