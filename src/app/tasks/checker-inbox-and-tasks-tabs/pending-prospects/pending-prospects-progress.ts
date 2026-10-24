/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { PendingProspect } from '../../tasks.service';

export interface ProspectProgress {
  currentStage?: string;
  lastCompletedStage?: string;
  pendingStep?: string;
}

/** Use only the backend's event-derived fields; registration and loan state are separate domains. */
export function resolveProspectProgress(prospect: PendingProspect): ProspectProgress {
  const known = (value?: string | null): string | undefined => {
    const code = value?.trim();
    return code && code.toUpperCase() !== 'UNKNOWN' ? code : undefined;
  };
  return {
    currentStage: known(prospect.currentStage),
    lastCompletedStage: known(prospect.lastCompletedStage),
    pendingStep: known(prospect.stoppedAtStage)
  };
}
