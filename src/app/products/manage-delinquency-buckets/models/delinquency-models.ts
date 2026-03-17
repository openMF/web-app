/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export const DELINQUENCY_BUCKET_TYPE = {
  REGULAR: 'regular',
  WORKING_CAPITAL: 'workingcapital'
} as const;

export type DelinquencyBucketType = (typeof DELINQUENCY_BUCKET_TYPE)[keyof typeof DELINQUENCY_BUCKET_TYPE];
