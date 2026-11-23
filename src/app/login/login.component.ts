/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, Component, OnInit, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { take } from 'rxjs/operators';
/**
 * Interface for version information.
 */
export interface VersionInfo {
  tenant?: string;
  mifos?: string;
  fineract?: {
    version?: string;
  };
}

/** Custom Models */
import { Alert } from '../core/alert/alert.model';

/** Custom Services */
import { AlertService } from '../core/alert/alert.service';
import { TranslateService } from '@ngx-translate/core';

/** Environment Imports */
import { environment } from '../../environments/environment';
import { SettingsService } from 'app/settings/settings.service';
import { TenantSelectorComponent } from '../shared/tenant-selector/tenant-selector.component';
import { LoginFormComponent } from './login-form/login-form.component';
import { TwoFactorAuthenticationComponent } from './two-factor-authentication/two-factor-authentication.component';
import { VerifyEmailComponent } from './staff-access/verify-email/verify-email.component';
import { ForgotPasswordComponent } from './staff-access/forgot-password/forgot-password.component';
import { StaffAccessService } from '../core/authentication/staff-access.service';
import { LanguageSelectorComponent } from '../shared/language-selector/language-selector.component';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { M3IconComponent } from '../shared/m3-ui/m3-icon/m3-icon.component';

import { VersionService } from '../system/version.service';

/**
 * Login component.
 */
@Component({
  selector: 'mifosx-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    TenantSelectorComponent,
    LoginFormComponent,
    TwoFactorAuthenticationComponent,
    VerifyEmailComponent,
    ForgotPasswordComponent,
    LanguageSelectorComponent,
    M3IconComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent implements OnInit {
  /** Whether to show the tenant selector dropdown */
  showTenantSelector = true;
  /** Show version info table if env allows */
  displayBackendInfo = environment.displayBackEndInfo !== 'false';
  /** Production mode - minimal hero with branding only */
  productionMode = environment.productionMode === true;

  private alertService = inject(AlertService);
  private settingsService = inject(SettingsService);
  private router = inject(Router);
  private versionService = inject(VersionService);
  private translateService = inject(TranslateService);
  private destroyRef = inject(DestroyRef);
  /** Sign-in help steps (verify email, reset password) shown in place of the sign-in form. */
  readonly staffAccess = inject(StaffAccessService);

  public environment = environment;

  /** Version info for display */
  versions: VersionInfo = {};
  /** Server info for display */
  server: string = '';

  /** Get tenant display name with first letter capitalized */
  get tenantDisplayName(): string {
    const tenant = this.versions?.tenant || this.settingsService.tenantIdentifier || 'default';
    return tenant.charAt(0).toUpperCase() + tenant.slice(1).toLowerCase();
  }

  /** True if user requires two factor authentication. */
  twoFactorAuthenticationRequired = false;

  /**
   * Subscribes to alert event of alert service.
   */
  ngOnInit() {
    this.staffAccess.backToSignIn();
    this.showTenantSelector = this.calculateTenantSelectorVisibility();

    // Subscribe to alerts
    this.alertService.alertEvent.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((alertEvent: Alert) => {
      const alertType = alertEvent.type;
      if (alertType === this.translateService.instant('errors.auth.passwordExpired.type')) {
        // The blocking "set a new password" dialog (opened from WebAppComponent) takes over from here.
        this.twoFactorAuthenticationRequired = false;
      } else if (alertType === this.translateService.instant('errors.auth.twoFactor.type')) {
        this.twoFactorAuthenticationRequired = true;
      } else if (alertType === this.translateService.instant('errors.auth.success.type')) {
        this.twoFactorAuthenticationRequired = false;
        this.router.navigate(['/'], { replaceUrl: true });
      }
    });

    // Load version info for table
    this.versionService
      .getBackendInfo()
      .pipe(take(1))
      .subscribe(
        (info: any) => {
          this.versions = {
            tenant: this.settingsService.tenantIdentifier,
            mifos: info?.mifos || info?.mifosX || info?.mifos_x || info?.version || environment.version,
            fineract:
              typeof info?.fineract === 'object' && info?.fineract !== null
                ? { version: info.fineract.version }
                : typeof info?.fineract === 'string'
                  ? { version: info.fineract }
                  : info?.fineractX || info?.fineract_x
                    ? { version: info.fineractX || info.fineract_x }
                    : { version: info?.git?.build?.version }
          };
        },
        () => {
          this.versions = {
            tenant: this.settingsService.tenantIdentifier,
            mifos: environment.version,
            fineract: { version: '' }
          };
        }
      );
    this.server = this.settingsService.server;
  }

  reloadSettings(): void {
    this.settingsService.setTenantIdentifier('');
    this.settingsService.setTenantIdentifier(environment.fineractPlatformTenantId || 'default');
    this.settingsService.setTenantIdentifiers(environment.fineractPlatformTenantIds.split(','));
    this.settingsService.setServers(environment.baseApiUrls.split(','));
    window.location.reload();
  }

  private calculateTenantSelectorVisibility(): boolean {
    if (environment.oauth.enabled) {
      return false;
    }
    if (environment.displayTenantSelector === 'false') {
      return false;
    }
    const tenantIds = environment.fineractPlatformTenantIds
      .split(',')
      .map((id) => id.trim())
      .filter((id) => id.length > 0);
    if (tenantIds.length === 0 || (tenantIds.length === 1 && tenantIds[0] === 'default')) {
      return false;
    }
    return true;
  }

  allowServerSwitch(): boolean {
    return environment.allowServerSwitch === 'false' ? false : true;
  }
}
