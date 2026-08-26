/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { CoopTokenService } from '../../services/coop-token.service';

export const coopAuthInterceptor: HttpInterceptorFn = (req, next) => {
  const coopTokenService = inject(CoopTokenService);

  const isCoopApi = req.url.includes('/api/nepal/coop-registration/');

  if (!isCoopApi) {
    return next(req);
  }

  const isPublicAuthApi =
    req.url.includes('/public/register') ||
    req.url.includes('/public/login') ||
    req.url.includes('/public/verify-email') ||
    req.url.includes('/public/resend-otp');

  if (isPublicAuthApi) {
    return next(req);
  }

  const accessToken = coopTokenService.getAccessToken();

  if (!accessToken) {
    return next(req);
  }

  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  return next(authReq);
};
