/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../core/authentication/authentication.service';
import { AlertService } from '../../core/alert/alert.service';
<<<<<<< HEAD
=======
import { TranslateService } from '@ngx-translate/core';
>>>>>>> origin/dev

@Component({
  selector: 'mifosx-callback',
  templateUrl: './callback.component.html'
})
export class CallbackComponent implements OnInit {
  private router = inject(Router);
  private alertService = inject(AlertService);
  private authenticationService = inject(AuthenticationService);
<<<<<<< HEAD
=======
  private translateService = inject(TranslateService);
>>>>>>> origin/dev

  async ngOnInit(): Promise<void> {
    try {
      const success = await this.authenticationService.handleOAuthCallback();

      if (success) {
        this.router.navigate(['/home']);
      } else {
        this.alertService.alert({
<<<<<<< HEAD
          type: 'Authentication Failed',
          message: 'Unable to complete authentication. Please try again.'
=======
          type: this.translateService.instant('errors.auth.callbackFailed.type'),
          message: this.translateService.instant('errors.auth.callbackFailed.message')
>>>>>>> origin/dev
        });
        this.router.navigate(['/login']);
      }
    } catch (error) {
      console.error('Authentication callback failed:', error);
      this.alertService.alert({
<<<<<<< HEAD
        type: 'Authentication Error',
        message: 'An error occurred during authentication. Please try again.'
=======
        type: this.translateService.instant('errors.auth.callbackError.type'),
        message: this.translateService.instant('errors.auth.callbackError.message')
>>>>>>> origin/dev
      });
      this.router.navigate(['/login']);
    }
  }
}
