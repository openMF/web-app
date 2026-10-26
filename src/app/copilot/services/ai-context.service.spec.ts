/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { EMPTY } from 'rxjs';
import { describe, it, expect, beforeEach } from '@jest/globals';

import { AiContextService } from './ai-context.service';
import { AuthenticationService } from '../../core/authentication/authentication.service';

interface RouteNode {
  params: Record<string, string>;
  data: Record<string, unknown>;
  firstChild: RouteNode | null;
}

function routeChain(levels: Array<Partial<RouteNode>>): RouteNode {
  let root: RouteNode | null = null;
  let prev: RouteNode | null = null;
  for (const level of levels) {
    const node: RouteNode = { params: level.params ?? {}, data: level.data ?? {}, firstChild: null };
    if (!root) {
      root = node;
    }
    if (prev) {
      prev.firstChild = node;
    }
    prev = node;
  }
  return root ?? { params: {}, data: {}, firstChild: null };
}

describe('AiContextService', () => {
  let service: AiContextService;
  const routerMock: any = { url: '/', events: EMPTY, routerState: { snapshot: { root: routeChain([]) } } };
  let credentials: any;
  const translateMock: any = { currentLang: 'en-US', defaultLang: 'en-US' };

  function setRoute(levels: Array<Partial<RouteNode>>, url: string): void {
    routerMock.routerState.snapshot.root = routeChain(levels);
    routerMock.url = url;
  }

  beforeEach(() => {
    setRoute([], '/');
    credentials = { username: 'priya', roles: [{ name: 'Loan Officer' }], permissions: ['READ_CLIENT'] };
    translateMock.currentLang = 'en-US';

    TestBed.configureTestingModule({
      providers: [
        AiContextService,
        { provide: Router, useValue: routerMock },
        { provide: AuthenticationService, useValue: { getCredentials: () => credentials } },
        { provide: TranslateService, useValue: translateMock }
      ]
    });
    service = TestBed.inject(AiContextService);
  });

  it('reads clientId from nested route params on a client detail page', () => {
    setRoute(
      [{ params: { clientId: '42' }, data: { clientViewData: { displayName: 'Rajesh Kumar' } } }],
      '/clients/42/general'
    );
    const ctx = service.getContextSnapshot();
    expect(ctx.clientId).toBe(42);
    expect(ctx.clientName).toBe('Rajesh Kumar');
    expect(ctx.screen).toBe('client-detail');
  });

  it('reads loanId and reports the loan-detail screen', () => {
    setRoute(
      [
        { params: { clientId: '42' } },
        { params: { loanId: '107' } }
      ],
      '/clients/42/loans-accounts/107/general'
    );
    const ctx = service.getContextSnapshot();
    expect(ctx.clientId).toBe(42);
    expect(ctx.loanId).toBe(107);
    expect(ctx.screen).toBe('loan-detail');
  });

  it('detects a client list view with no specific client', () => {
    setRoute([{ data: { title: 'Clients' } }], '/clients');
    const ctx = service.getContextSnapshot();
    expect(ctx.clientId).toBeNull();
    expect(ctx.clientName).toBeNull();
    expect(ctx.screen).toBe('client-list');
    expect(service.hasSpecificClient()).toBe(false);
  });

  it('reports the dashboard screen at the root url', () => {
    setRoute([], '/');
    expect(service.getContextSnapshot().screen).toBe('dashboard');
  });

  it('treats an invalid clientId as null', () => {
    setRoute([{ params: { clientId: 'abc' } }], '/clients/abc');
    expect(service.getContextSnapshot().clientId).toBeNull();
  });

  it('reads the logged-in user and role from credentials', () => {
    const ctx = service.getContextSnapshot();
    expect(ctx.loggedInUser).toBe('priya');
    expect(ctx.role).toBe('Loan Officer');
  });

  it('falls back to empty user/role when not authenticated', () => {
    credentials = null;
    const ctx = service.getContextSnapshot();
    expect(ctx.loggedInUser).toBe('');
    expect(ctx.role).toBe('');
  });

  it('exposes a lowercase two-letter language code from the active translation', () => {
    translateMock.currentLang = 'es-MX';
    expect(service.getContextSnapshot().language).toBe('es');
    translateMock.currentLang = 'EN-US';
    expect(service.getContextSnapshot().language).toBe('en');
  });

  it('hasSpecificClient and getCurrentClientId reflect the focused client', () => {
    setRoute([{ params: { clientId: '7' } }], '/clients/7/general');
    expect(service.hasSpecificClient()).toBe(true);
    expect(service.getCurrentClientId()).toBe(7);
  });
});
