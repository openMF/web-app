/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Environment Configuration */
import { SettingsService } from 'app/settings/settings.service';

/**
 * Http request interceptor to prefix a request with `serverUrl`.
 */
@Injectable()
export class ApiPrefixInterceptor implements HttpInterceptor {
  private settingsService = inject(SettingsService);

  /**
   * Intercepts a Http request and prefixes it with `serverUrl`.
   */
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let baseUrl = this.settingsService.serverUrl;

    const versionRegex = /^\/(v[1-9][0-9]*\/).*$/;
    if (versionRegex.test(request.url)) {
      baseUrl = this.settingsService.baseServerUrl;
    }
    if (request.url.includes('/actuator/')) {
      baseUrl = this.settingsService.serverHost;
    }

    /**
     * Ignore URLs that are complete for i18n
     * **__NOTE__** OAuth2 endpoints are handled by angular-oauth2-oidc library
     */
    if (!request.url.includes('http:') && !request.url.includes('https:')) {
      request = request.clone({ url: baseUrl + request.url });
    }
    return next.handle(request);
  }
}
