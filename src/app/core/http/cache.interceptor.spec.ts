/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { HttpHeaders, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, of, Subject, throwError } from 'rxjs';
import { CacheInterceptor } from './cache.interceptor';
import { HttpCacheService } from './http-cache.service';
import { environment } from '../../../environments/environment';

describe('CacheInterceptor', () => {
  let httpCacheService: HttpCacheService;
  let interceptor: CacheInterceptor;
  let nextHandler: { handle: jest.Mock };

  beforeEach(() => {
    httpCacheService = new HttpCacheService();
    interceptor = new CacheInterceptor(httpCacheService);
    nextHandler = {
      handle: jest.fn()
    };
  });

  it('passes non-GET requests directly without caching', (done) => {
    const request = new HttpRequest('POST', '/api/v1/clients', { name: 'Client' });
    const response = new HttpResponse({ status: 201 });
    nextHandler.handle.mockReturnValue(of(response));

    const spy = jest.spyOn(httpCacheService, 'setCacheData');

    interceptor.intercept(request, nextHandler as any).subscribe((event) => {
      expect(event).toBe(response);
      expect(nextHandler.handle).toHaveBeenCalledWith(request);
      expect(spy).not.toHaveBeenCalled();
      done();
    });
  });

  it('returns cached response when available without calling handler', (done) => {
    const url = '/api/v1/users';
    const request = new HttpRequest('GET', url);
    const headers = new HttpHeaders({ 'X-Custom': 'val' });
    const cachedResponse = new HttpResponse({ body: { id: 1 }, headers, status: 200, url });

    httpCacheService.setCacheData(request.urlWithParams, cachedResponse);

    interceptor.intercept(request, nextHandler as any).subscribe((event) => {
      expect(event).toBeInstanceOf(HttpResponse);
      const res = event as HttpResponse<any>;
      expect(res.body).toEqual({ id: 1 });
      expect(res.headers.get('X-Custom')).toBe('val');
      expect(nextHandler.handle).not.toHaveBeenCalled();
      done();
    });
  });

  it('fetches and caches response on cache miss when httpCacheEnabled is true', (done) => {
    const url = '/api/v1/clients';
    const request = new HttpRequest('GET', url);
    const response = new HttpResponse({ body: [{ id: 10 }], status: 200 });
    nextHandler.handle.mockReturnValue(of(response));

    const prevCacheSetting = environment.httpCacheEnabled;
    environment.httpCacheEnabled = true;

    interceptor.intercept(request, nextHandler as any).subscribe((event) => {
      expect(event).toBe(response);
      expect(nextHandler.handle).toHaveBeenCalledWith(request);
      expect(httpCacheService.getCacheData(request.urlWithParams)?.body).toEqual([{ id: 10 }]);
      environment.httpCacheEnabled = prevCacheSetting;
      done();
    });
  });

  it('forces update and bypasses cache when configured with update: true', (done) => {
    const url = '/api/v1/offices';
    const request = new HttpRequest('GET', url);
    const cachedResponse = new HttpResponse({ body: 'old-data' });
    const freshResponse = new HttpResponse({ body: 'fresh-data' });

    httpCacheService.setCacheData(request.urlWithParams, cachedResponse);
    nextHandler.handle.mockReturnValue(of(freshResponse));

    const configured = interceptor.configure({ update: true });

    configured.intercept(request, nextHandler as any).subscribe((event) => {
      expect((event as HttpResponse<any>).body).toBe('fresh-data');
      expect(nextHandler.handle).toHaveBeenCalledWith(request);
      done();
    });
  });

  it('propagates errors from handler', (done) => {
    const request = new HttpRequest('GET', '/api/v1/error');
    const error = new Error('Network failure');
    nextHandler.handle.mockReturnValue(throwError(() => error));

    interceptor.intercept(request, nextHandler as any).subscribe({
      next: () => done.fail('Should have failed'),
      error: (err) => {
        expect(err).toBe(error);
        done();
      }
    });
  });

  it('unsubscribes upstream request when downstream subscription is cancelled', () => {
    const request = new HttpRequest('GET', '/api/v1/cancelable');
    let unsubscribed = false;

    const source$ = new Observable<HttpResponse<any>>(() => {
      return () => {
        unsubscribed = true;
      };
    });
    nextHandler.handle.mockReturnValue(source$);

    const subscription = interceptor.intercept(request, nextHandler as any).subscribe();
    expect(unsubscribed).toBe(false);

    subscription.unsubscribe();
    expect(unsubscribed).toBe(true);
  });

  it('delivers successful HTTP response even if cache persistence fails', (done) => {
    httpCacheService.setPersistence('local');
    (window.localStorage.setItem as jest.Mock).mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });

    const url = '/api/v1/clients';
    const request = new HttpRequest('GET', url);
    const response = new HttpResponse({ body: [{ id: 1 }], status: 200 });
    nextHandler.handle.mockReturnValue(of(response));

    const prevCacheSetting = environment.httpCacheEnabled;
    environment.httpCacheEnabled = true;

    interceptor.intercept(request, nextHandler as any).subscribe({
      next: (event) => {
        expect(event).toBe(response);
        expect(httpCacheService.getCacheData(request.urlWithParams)).toBe(response);
        environment.httpCacheEnabled = prevCacheSetting;
        done();
      },
      error: () => {
        environment.httpCacheEnabled = prevCacheSetting;
        done.fail('Request should have succeeded despite cache failure');
      }
    });
  });
});
