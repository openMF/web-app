/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Injectable, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslateService } from '@ngx-translate/core';

import { AuthenticationService } from '../../core/authentication/authentication.service';
import { CopilotContext } from '../core/models/copilot-context.model';

/**
 * Derives the Copilot context (focused client/loan, screen, user, language)
 * from the router state, auth credentials and active translation, so the user
 * never has to type which record they are on.
 */
@Injectable({ providedIn: 'root' })
export class AiContextService {
  private readonly router = inject(Router);
  private readonly authenticationService = inject(AuthenticationService);
  private readonly translateService = inject(TranslateService);

  /** Fresh context after every completed navigation. */
  readonly context$: Observable<CopilotContext> = this.router.events.pipe(
    filter((event) => event instanceof NavigationEnd),
    map(() => this.getContextSnapshot())
  );

  readonly context = toSignal(this.context$, { initialValue: this.getContextSnapshot() });

  getContextSnapshot(): CopilotContext {
    const { params, data, url } = this.collectRouteState();
    const credentials = this.authenticationService.getCredentials();
    const clientId = this.toId(params['clientId']);
    const loanId = this.toId(params['loanId']);

    return {
      clientId,
      clientName: data['clientViewData']?.displayName ?? null,
      loanId,
      screen: this.deriveScreen(clientId, loanId, url),
      loggedInUser: credentials?.username ?? '',
      role: this.currentRole(credentials?.roles),
      language: this.currentLanguage()
    };
  }

  /** Only true on a single-client detail page; drives prompt disambiguation. */
  hasSpecificClient(): boolean {
    return this.getContextSnapshot().clientId !== null;
  }

  getCurrentClientId(): number | null {
    return this.getContextSnapshot().clientId;
  }

  // Merge params + resolved data from root down to the deepest route, so nested
  // ids (clientId/loanId) and the resolved clientViewData are all visible.
  private collectRouteState(): { params: Record<string, unknown>; data: Record<string, any>; url: string } {
    const params: Record<string, unknown> = {};
    const data: Record<string, any> = {};
    let route = this.router.routerState.snapshot.root;
    while (route) {
      Object.assign(params, route.params);
      Object.assign(data, route.data);
      route = route.firstChild as typeof route;
    }
    return { params, data, url: this.router.url };
  }

  private toId(value: unknown): number | null {
    const id = Number(value);
    return Number.isInteger(id) && id > 0 ? id : null;
  }

  private deriveScreen(clientId: number | null, loanId: number | null, url: string): string {
    if (loanId !== null) {
      return 'loan-detail';
    }
    if (clientId !== null) {
      return 'client-detail';
    }
    const path = url.split('?')[0];
    if (path.startsWith('/clients')) {
      return 'client-list';
    }
    if (path === '/' || path.startsWith('/home') || path.startsWith('/dashboard')) {
      return 'dashboard';
    }
    return path.split('/').filter(Boolean)[0] ?? 'dashboard';
  }

  private currentRole(roles: unknown): string {
    if (!Array.isArray(roles) || roles.length === 0) {
      return '';
    }
    return (roles[0] as { name?: string })?.name ?? '';
  }

  private currentLanguage(): string {
    const lang = this.translateService.currentLang || this.translateService.defaultLang || 'en';
    return lang.substring(0, 2).toLowerCase();
  }
}
