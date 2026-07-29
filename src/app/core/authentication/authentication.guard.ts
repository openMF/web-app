/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';

/** Custom Services */
import { Logger } from '../logger/logger.service';
import { AuthenticationService } from './authentication.service';

/** Initialize logger */
const log = new Logger('AuthenticationGuard');

/**
 * Route access authorization.
 */
@Injectable()
export class AuthenticationGuard {
  private router = inject(Router);
  private authenticationService = inject(AuthenticationService);

  /**
   * Ensures route access is authorized only when user is authenticated, otherwise redirects to login.
   *
   * When the session is missing, the originally requested URL is preserved as a
   * `returnUrl` query param so the user lands on that page after logging in.
   *
   * @returns {boolean} True if user is authenticated.
   */
  canActivate(_route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.authenticationService.isAuthenticated()) {
      return true;
    }

    log.debug('User not authenticated, redirecting to login...');
    this.authenticationService.logout();
    this.redirectToLogin(state.url);
    return false;
  }

  /**
   * Redirects to the login page, preserving the attempted URL as `returnUrl`.
   * The root path and the login page itself are not preserved.
   */
  private redirectToLogin(attemptedUrl: string): void {
    const shouldPreserve = attemptedUrl && attemptedUrl !== '/' && !attemptedUrl.startsWith('/login');
    this.router.navigate(['/login'], {
      replaceUrl: true,
      queryParams: shouldPreserve ? { returnUrl: attemptedUrl } : {}
    });
  }
}
