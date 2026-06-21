/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { inject } from '@angular/core';
import { CanMatchFn } from '@angular/router';
import { CopilotFeatureService } from './services/copilot-feature.service';

/**
 * Route guard for the lazily-loaded Copilot feature.
 * Blocks loading entirely when the deployment flag is off so disabled
 * builds ship zero Copilot bytes. (CanMatch - CanLoad is deprecated.)
 */
export const copilotEnabledGuard: CanMatchFn = () => {
  return inject(CopilotFeatureService).isEnabledForDeployment();
};
