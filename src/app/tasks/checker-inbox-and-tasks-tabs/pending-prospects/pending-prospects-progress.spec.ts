/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { describe, expect, it } from '@jest/globals';
import { resolveProspectProgress } from './pending-prospects-progress';

describe('authoritative prospect progress', () => {
  it('keeps current, completed and outstanding stages independent', () => {
    expect(
      resolveProspectProgress({
        currentStage: 'KYC_LEVEL_1',
        lastCompletedStage: 'COMMERCIAL_REGISTRATION',
        stoppedAtStage: 'KYC_LEVEL_1'
      })
    ).toEqual({
      currentStage: 'KYC_LEVEL_1',
      lastCompletedStage: 'COMMERCIAL_REGISTRATION',
      pendingStep: 'KYC_LEVEL_1'
    });
  });
  it('does not infer a pending step from a current stage or registration state', () => {
    expect(
      resolveProspectProgress({ currentStage: 'KYC_LEVEL_1', registrationStatus: 'PENDING', pendingCreditCount: 1 })
        .pendingStep
    ).toBeUndefined();
    expect(resolveProspectProgress({ registrationStatus: 'COMPLETED' }).lastCompletedStage).toBeUndefined();
  });
  it('retains only known fields in partial event summaries', () => {
    expect(
      resolveProspectProgress({
        currentStage: 'UNKNOWN',
        lastCompletedStage: 'COMMERCIAL_REGISTRATION',
        stoppedAtStage: null
      })
    ).toEqual({ currentStage: undefined, lastCompletedStage: 'COMMERCIAL_REGISTRATION', pendingStep: undefined });
  });
  it('handles unknown, blank and absent fields without inventing a universal stage order', () => {
    expect(resolveProspectProgress({ currentStage: ' unknown ', lastCompletedStage: '', stoppedAtStage: ' ' })).toEqual(
      { currentStage: undefined, lastCompletedStage: undefined, pendingStep: undefined }
    );
    expect(resolveProspectProgress({ currentStage: 'PRODUCT_DEFINED_STAGE' }).currentStage).toBe(
      'PRODUCT_DEFINED_STAGE'
    );
  });
});
