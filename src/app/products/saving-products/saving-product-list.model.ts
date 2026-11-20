/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { _ as extract } from '@ngx-translate/core';

/** BE-01 ProductPolicyData enums. Purpose is independent of accounting classification. */
export const CLASSIFICATION_LABELS = {
  SIGHT: extract('SavingsProducts.Sight'),
  INTEREST_BEARING_SIGHT: extract('SavingsProducts.InterestBearingSight'),
  SAVINGS: extract('SavingsProducts.Savings')
} as const;

const PURPOSE_LABELS: Record<string, string> = {
  MAIN: extract('SavingsProducts.Main'),
  GUARANTEED: extract('SavingsProducts.Guaranteed'),
  PLANNED_MAIN: extract('SavingsProducts.PlannedMain'),
  POCKET: extract('SavingsProducts.Pocket')
};

export interface SavingsProductSummary {
  id: number;
  name: string;
  shortName?: string;
  currency?: { code?: string };
  nominalAnnualInterestRate?: number;
}

/** Only fields consumed by the listing; BE-01 policies never activate financial behavior. */
export interface SavingsProductPolicy {
  savingsProductId: number;
  revision?: number | null;
  status: string;
  operational: boolean;
  policy?: { classification?: string; purpose?: string; interestMode?: string } | null;
}

export type MetadataState = 'available' | 'unavailable' | 'forbidden';

export interface SavingsProductRow extends SavingsProductSummary {
  classification: string;
  classificationLabel: string;
  purposeLabel: string;
  policyStatusLabel: string;
  metadataState: MetadataState;
}

export function toSavingsProductRow(
  product: SavingsProductSummary,
  configuration?: SavingsProductPolicy,
  metadataState: MetadataState = 'unavailable'
): SavingsProductRow {
  const classification = configuration?.policy?.classification;
  const knownClassification = Object.prototype.hasOwnProperty.call(CLASSIFICATION_LABELS, classification);
  return {
    ...product,
    classification: classification
      ? knownClassification
        ? classification
        : 'UNKNOWN'
      : metadataState === 'available'
        ? 'UNCLASSIFIED'
        : 'UNAVAILABLE',
    classificationLabel: classification
      ? knownClassification
        ? CLASSIFICATION_LABELS[classification as keyof typeof CLASSIFICATION_LABELS]
        : extract('SavingsProducts.UnknownClassification')
      : metadataState === 'available'
        ? extract('SavingsProducts.Legacy')
        : extract('SavingsProducts.Unavailable'),
    purposeLabel: configuration?.policy?.purpose
      ? Object.prototype.hasOwnProperty.call(PURPOSE_LABELS, configuration.policy.purpose)
        ? PURPOSE_LABELS[configuration.policy.purpose]
        : extract('SavingsProducts.UnknownPurpose')
      : extract('SavingsProducts.NotAvailable'),
    policyStatusLabel:
      configuration?.status === 'DRAFT'
        ? extract('SavingsProducts.DraftPolicy')
        : configuration?.status === 'UNCONFIGURED'
          ? extract('SavingsProducts.Unconfigured')
          : extract('SavingsProducts.NotAvailable'),
    metadataState
  };
}

/** Error/empty messages selected dynamically in the template. */
export const SAVINGS_PRODUCT_MESSAGES = [
  extract('SavingsProducts.AccessDenied'),
  extract('SavingsProducts.LoadFailed'),
  extract('SavingsProducts.MetadataDenied'),
  extract('SavingsProducts.MetadataUnavailable'),
  extract('SavingsProducts.NoMatches'),
  extract('SavingsProducts.NoProducts'),
  extract('SavingsProducts.ViewProduct'),
  extract('SavingsProducts.EditProduct')
];
