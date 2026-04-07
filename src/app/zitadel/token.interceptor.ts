import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, from } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  public environment = environment;
  FINERACT_PLATFORM_TENANT_IDENTIFIER = environment.fineractPlatformTenantId;

  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getAccessToken();
    let headersConfig: { [key: string]: string } = {
      'Fineract-Platform-TenantId': this.FINERACT_PLATFORM_TENANT_IDENTIFIER,
      'Content-Type': req.headers.get('Content-Type') || 'application/json'
    };
    const publicEndpoints = [
      '/auth/test',
      '/health'
    ];
    const isPublicEndpoint = publicEndpoints.some((url) => req.url.includes(url));

    if (token && !isPublicEndpoint) {
      headersConfig['Authorization'] = `Bearer ${token}`;
    }

    const authReq = req.clone({ setHeaders: headersConfig });

    return next.handle(authReq).pipe(
      catchError((err) => {
        if (err instanceof HttpErrorResponse && err.status === 401 && !isPublicEndpoint) {
          return from(this.handle401Error(authReq, next));
        }
        return throwError(() => err);
      })
    );
  }

  private async handle401Error(request: HttpRequest<any>, next: HttpHandler): Promise<HttpEvent<any>> {
    try {
      await this.authService.refreshToken();
      const newToken = this.authService.getAccessToken();
      if (newToken) {
        const retriedReq = request.clone({
          setHeaders: {
            Authorization: `Bearer ${newToken}`,
            'Fineract-Platform-TenantId': this.FINERACT_PLATFORM_TENANT_IDENTIFIER,
            'Content-Type': request.headers.get('Content-Type') || 'application/json'
          }
        });
        return next.handle(retriedReq).toPromise() as Promise<HttpEvent<any>>;
      } else {
        throw new Error('No new access token obtained after refresh');
      }
    } catch (e) {
      console.error('Error in handle401Error, forcing logout');
      throw e;
    }
  }
}
