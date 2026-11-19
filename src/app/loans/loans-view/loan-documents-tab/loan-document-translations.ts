/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Translation-extractor markers for dynamically selected labels. */
function extract(value: string): string {
  return value;
}
export const LOAN_DOCUMENT_TRANSLATION_KEYS = [
  extract('loanDocuments.categories.contract'),
  extract('loanDocuments.categories.authorization'),
  extract('loanDocuments.categories.consultation'),
  extract('loanDocuments.categories.evaluation'),
  extract('loanDocuments.categories.financial'),
  extract('loanDocuments.categories.identity'),
  extract('loanDocuments.categories.other'),
  extract('loanDocuments.pending'),
  extract('loanDocuments.uploading'),
  extract('loanDocuments.success'),
  extract('loanDocuments.failed'),
  extract('loanDocuments.loadFailed'),
  extract('loanDocuments.downloadFailed'),
  extract('loanDocuments.zipFailed'),
  extract('loanDocuments.zipLimit'),
  extract('loanDocuments.deleteFailed'),
  extract('loanDocuments.noMatches'),
  extract('loanDocuments.empty'),
  extract('loanDocuments.file'),
  extract('loanDocuments.unavailable'),
  extract('loanDocuments.moreActions')
];
