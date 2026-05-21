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
   * Ensures route access is authorized only when user is authenticated.
   *
   * If unauthenticated, redirects to /login while preserving the originally
   * requested URL in the `returnUrl` query param so the LoginComponent can
   * restore it after a successful authentication.
   *
   * @param _route Activated route snapshot (unused, kept for guard signature).
   * @param state  Router state — provides the URL the user was trying to reach.
   * @returns {boolean} True if user is authenticated.
   */
  canActivate(_route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.authenticationService.isAuthenticated()) {
      return true;
    }

    log.debug(`User not authenticated, redirecting to login (target was: ${state.url})...`);
    this.authenticationService.logout();

    // Preserve the originally requested URL so the user can be sent back
    // there after authenticating. We only forward non-trivial targets
    // (avoid carrying "/" or "/login" as the returnUrl). The login check
    // matches the exact /login path (with optional query/fragment) so
    // unrelated routes like /login-history keep their deep link.
    const targetUrl = state.url;
    const isLoginTarget = targetUrl === '/login' || targetUrl.startsWith('/login?') || targetUrl.startsWith('/login#');
    const isMeaningfulTarget = !!targetUrl && targetUrl !== '/' && !isLoginTarget;

    this.router.navigate(['/login'], {
      queryParams: isMeaningfulTarget ? { returnUrl: targetUrl } : {},
      replaceUrl: true
    });
    return false;
  }
}
