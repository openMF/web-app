/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpResponse } from '@angular/common/http';

/** rxjs Imports */
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

/** Custom Services */
import { HttpCacheService } from './http-cache.service';
import { environment } from '../../../environments/environment';

/**
 * Caches HTTP requests.
 * Use ExtendedHttpClient fluent API to configure caching for each request.
 */
@Injectable()
export class CacheInterceptor implements HttpInterceptor {
  private forceUpdate = false;

  // eslint-disable-next-line @angular-eslint/prefer-inject
  constructor(private httpCacheService: HttpCacheService) {}

  /**
   * Configures interceptor options
   * @param {{update: boolean}} options If update option is enabled, forces request to be made and updates cache entry.
   * @return {CacheInterceptor} The configured instance.
   */
  configure(options?: { update?: boolean } | null): CacheInterceptor {
    const instance = new CacheInterceptor(this.httpCacheService);
    if (options && options.update) {
      instance.forceUpdate = true;
    }
    return instance;
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (request.method !== 'GET') {
      return next.handle(request);
    }

    const cachedData = this.forceUpdate ? null : this.httpCacheService.getCacheData(request.urlWithParams);
    if (cachedData !== null) {
      // Create new response to avoid side-effects
      return of(cachedData instanceof HttpResponse ? cachedData.clone() : new HttpResponse(cachedData as any));
    }

    return next.handle(request).pipe(
      tap((event) => {
        if (environment.httpCacheEnabled && event instanceof HttpResponse) {
          this.httpCacheService.setCacheData(request.urlWithParams, event);
        }
      })
    );
  }
}
