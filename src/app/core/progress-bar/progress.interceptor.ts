/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';

/** rxjs Imports */
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

/** Custom Services */
import { ProgressBarService } from './progress-bar.service';

/**
 * Http Request interceptor to start/stop loading the progress bar.
 */
@Injectable()
export class ProgressInterceptor implements HttpInterceptor {
  private progressBarService = inject(ProgressBarService);

  /**
   * Intercepts a Http request to start loading the progress bar for a pending request
   * and stop when a response or error is received.
   */
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.progressBarService.increase();
    return next.handle(request).pipe(
      finalize(() => {
        this.progressBarService.decrease();
      })
    );
  }
}
