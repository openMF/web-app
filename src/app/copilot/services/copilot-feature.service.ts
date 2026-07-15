/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Injectable } from '@angular/core';

/** Environment */
import { environment } from '../../../environments/environment';

const PANEL_STATE_KEY = 'copilot_panel_state';

/**
 * Three-level feature flag:
 *   L1 deployment  -> environment.enableCopilot   (implemented)
 *   L2 role         -> READ_COPILOT permission on the JWT   (TODO: pass-through)
 *   L3 user pref    -> expanded / collapsed / hidden in localStorage
 */
@Injectable({ providedIn: 'root' })
export class CopilotFeatureService {
  /** L1: is the feature enabled for this deployment? Master switch. */
  isEnabledForDeployment(): boolean {
    return environment.enableCopilot === true;
  }

  /** L2: does the logged-in user's role allow the Copilot? TODO: check READ_COPILOT. */
  hasPermission(): boolean {
    // TODO: this.authenticationService.getUserPermissions().includes('READ_COPILOT')
    return true;
  }

  /** L3: user has not hidden the panel for this session. */
  private isNotHiddenByUser(): boolean {
    return localStorage.getItem(PANEL_STATE_KEY) !== 'hidden';
  }

  /** L1 && L2 && L3: should the panel render for this user right now? */
  shouldShowPanel(): boolean {
    return this.isEnabledForDeployment() && this.hasPermission() && this.isNotHiddenByUser();
  }
}
