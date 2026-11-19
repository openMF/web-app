/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { InjectionToken } from '@angular/core';
import { LoanDocumentCategoryKey } from './loan-document-categories.config';
export type LoanDocumentRequirement = { labelKey: string } & (
  { number: number } | { category: LoanDocumentCategoryKey } | { code: string }
);
export interface LoanDocumentScheme {
  numbers: readonly number[];
  labels?: Readonly<Record<number, string>>;
  requirements: readonly LoanDocumentRequirement[];
}
/** Deployment-owned configuration keyed by resolved loanDetailsData.loanProductId.
 * Intentionally empty: WEB-1452 does not prescribe any production product rules.
 * numbers also defines presentation order; duplicates are counted once. Labels are translation keys.
 * Number prefill is advisory: only a verified persisted CURP-NN-CODE filename fills a slot.
 */
export const LOAN_DOCUMENT_SCHEMES = new InjectionToken<Readonly<Record<number, LoanDocumentScheme>>>(
  'LOAN_DOCUMENT_SCHEMES',
  { providedIn: 'root', factory: () => ({}) }
);
