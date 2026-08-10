/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Injectable, inject } from '@angular/core';

/** Custom Services */
import { AuthenticationService } from '../../core/authentication/authentication.service';

/** Environment */
import { environment } from '../../../environments/environment';

/** Copilot Config */
import { COPILOT_CONFIG } from '../copilot.config';

const PANEL_STATE_KEY = 'copilot_panel_state';

/**
 * Three-level feature flag:
 *   L1 deployment  -> environment.enableCopilot (master switch, zero bytes when off)
 *   L2 role        -> the logged-in user holds one of the allowed permissions
 *                     (ALL_FUNCTIONS / USE_MCP_TOOLS / READ_COPILOT). This is a
 *                     UX gate only — Fineract RBAC re-checks every tool call
 *                     server-side with the officer's own credential.
 *   L3 user pref   -> expanded / collapsed / hidden in localStorage
 */
@Injectable({ providedIn: 'root' })
export class CopilotFeatureService {
  private readonly authenticationService = inject(AuthenticationService);
  private readonly config = inject(COPILOT_CONFIG);

  /** L1: is the feature enabled for this deployment? Master switch. */
  isEnabledForDeployment(): boolean {
    return environment.enableCopilot === true;
  }

  /** L2: does the logged-in user hold any permission that allows the Copilot? */
  hasPermission(): boolean {
    const credentials = this.authenticationService.getCredentials();
    if (!credentials) {
      return false;
    }
    const permissions: string[] = Array.isArray(credentials.permissions) ? credentials.permissions : [];
    return this.config.allowedPermissions.some((permission) => permissions.includes(permission));
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
