/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Injectable } from '@angular/core';

/** Models */
import { CopilotContext } from '../core/models/copilot-context.model';

/**
 * Builds the CopilotContext automatically from three sources:
 *   1. Angular Router + route params  -> clientId, loanId, screen
 *   2. Client-service observables      -> clientName
 *   3. AuthenticationService (JWT)      -> loggedInUser, role, language
 * The user never types any of this.
 */
@Injectable({ providedIn: 'root' })
export class AiContextService {
  /** Snapshot of the current context for synchronous reads. */
  getContextSnapshot(): CopilotContext {
    // TODO: assemble from router + client service + JWT.
    throw new Error('Not implemented');
  }

  /** True only on single-client detail pages (drives disambiguation). */
  hasSpecificClient(): boolean {
    // TODO: clientId !== null.
    throw new Error('Not implemented');
  }

  /** Convenience accessor used by chat.service. */
  getCurrentClientId(): number | null {
    // TODO: read from snapshot.
    throw new Error('Not implemented');
  }
}
