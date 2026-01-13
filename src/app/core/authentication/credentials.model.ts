/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * Credentials model.
 */
export interface Credentials {
  accessToken?: string;
  authenticated: boolean;
  base64EncodedAuthenticationKey?: string;
  isTwoFactorAuthenticationRequired?: boolean;
  officeId: number;
  officeName: string;
  staffId?: number;
  staffDisplayName?: string;
  organizationalRole?: any;
  permissions: string[];
  roles: any;
  userId: number;
  username: string;
  shouldRenewPassword: boolean;
  rememberMe?: boolean;
}
