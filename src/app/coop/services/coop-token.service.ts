/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Injectable } from '@angular/core';

export interface CoopAuthSession {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  status: 'UNVERIFIED' | 'VERIFIED';
}

@Injectable({
  providedIn: 'root'
})
export class CoopTokenService {
  private readonly storageKey = 'coopAuthSession';

  /**
   * Save complete Coop authentication session
   */
  setSession(session: CoopAuthSession): void {
    localStorage.setItem(this.storageKey, JSON.stringify(session));
  }

  /**
   * Get complete Coop authentication session
   */
  getSession(): CoopAuthSession | null {
    const session = localStorage.getItem(this.storageKey);

    if (!session) {
      return null;
    }

    try {
      return JSON.parse(session) as CoopAuthSession;
    } catch {
      return null;
    }
  }

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    return this.getSession()?.accessToken ?? null;
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    return this.getSession()?.refreshToken ?? null;
  }

  /**
   * Check whether user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  /**
   * Clear Coop authentication
   */
  clearSession(): void {
    localStorage.removeItem(this.storageKey);
  }
}
