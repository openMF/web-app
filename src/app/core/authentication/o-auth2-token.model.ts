/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * OAuth2/OIDC token response model.
 */
export interface OAuth2Token {
  access_token: string;
  token_type: string;
  refresh_token?: string;
  expires_in: number;
  scope?: string;
  // ID token (only present in OIDC responses)
  id_token?: string;
}
