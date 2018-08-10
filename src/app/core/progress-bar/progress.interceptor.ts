import { Injectable } from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse} from '@angular/common/http';

import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

import { ProgressBarService } from './progress-bar.service';

@Injectable()
export class ProgressInterceptor implements HttpInterceptor {

  constructor(private progressBarService: ProgressBarService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.progressBarService.increase();
    return next.handle(request)
      .pipe(
        tap(event => {
          if (event instanceof HttpResponse) {
            this.progressBarService.decrease();
          }
        })
      )
      .pipe(
        catchError(error => {
          this.progressBarService.decrease();
          throw error;
        })
      );
  }

}
