/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatCardHeader, MatCardTitle, MatCardSubtitle } from '@angular/material/card';

/** Translation Imports */
import { TranslateService } from '@ngx-translate/core';

/** Custom Components */
import { InputPasswordComponent } from 'app/shared/input-password/input-password.component';

/** Custom Services */
import { TenantMasterSessionService } from '../tenant-master-session.service';

/** Custom Models */
import { tenantManagementErrorMessage } from '../tenant-management-error';

/** Shared Imports */
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Master sign-in card for the tenant management section.
 *
 * Failures are reported on the card rather than through the global alert, because the credential
 * being rejected here is not the one the rest of the app is signed in with.
 */
@Component({
  selector: 'mifosx-tenant-master-login',
  templateUrl: './master-login.component.html',
  styleUrls: ['./master-login.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent,
    InputPasswordComponent,
    MatCardHeader,
    MatCardTitle,
    MatCardSubtitle
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TenantMasterLoginComponent {
  private formBuilder = inject(FormBuilder);
  private session = inject(TenantMasterSessionService);
  private translateService = inject(TranslateService);

  /** Master sign-in form. */
  masterLoginForm = this.formBuilder.group({
    username: [
      '',
      Validators.required
    ],
    password: [
      '',
      Validators.required
    ]
  });

  /** True while the credential is being verified. */
  readonly submitting = signal(false);
  /** Why the last attempt failed, or `null`. */
  readonly errorMessage = signal<string | null>(null);

  signIn(): void {
    if (this.masterLoginForm.invalid || this.submitting()) {
      return;
    }
    const { username, password } = this.masterLoginForm.getRawValue();
    this.submitting.set(true);
    this.errorMessage.set(null);
    this.session.signIn(username, password).subscribe({
      // Signing in swaps this card for the section itself, so there is nothing to do on success.
      error: (error: HttpErrorResponse) => {
        this.submitting.set(false);
        this.errorMessage.set(this.messageFor(error));
      }
    });
  }

  /**
   * A rejected credential and an absent plugin are the two failures worth naming: the first is the
   * user's own mistake, the second means this server cannot offer the feature at all.
   */
  private messageFor(error: HttpErrorResponse): string {
    if (error.status === 401) {
      return this.translateService.instant('errors.tenantManagement.signInRejected');
    }
    if (error.status === 404) {
      return this.translateService.instant('errors.tenantManagement.notAvailable');
    }
    return tenantManagementErrorMessage(error) || this.translateService.instant('errors.tenantManagement.unknown');
  }
}
