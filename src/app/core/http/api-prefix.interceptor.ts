/** Angular Imports */
import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Environment Configuration */
import { SettingsService } from 'app/settings/settings.service';
import { HttpCacheService } from './http-cache.service';

/**
 * Http request interceptor to prefix a request with `serverUrl`.
 */
@Injectable()
export class ApiPrefixInterceptor implements HttpInterceptor {
  /**
   * @param {SettingsService} settingsService Settings Service
   */
  constructor(private settingsService: SettingsService, private cacheService: HttpCacheService) {}

  /**
   * Intercepts a Http request and prefixes it with `serverUrl`.
   */
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    /**
     * Ignore URLs that are complete for i18n
     */
    if (!request.url.includes('http:') && !request.url.includes('https:')) {
      request = request.clone({ url: this.settingsService.serverUrl + request.url });
    }

    if (request.method === 'PUT' || request.method === 'POST' || request.method === 'DELETE') {
      this.cacheService.cleanCache();
    }

    return next.handle(request);
  }
}
