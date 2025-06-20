/** Angular Imports */
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

/** rxjs Imports */
import { Subscription } from 'rxjs';

/** Custom Models */
import { Alert } from '../core/alert/alert.model';

/** Custom Services */
import { AlertService } from '../core/alert/alert.service';

/** Environment Imports */
import { environment } from '../../environments/environment';
import { SettingsService } from 'app/settings/settings.service';
import { LanguageSelectorComponent } from '../shared/language-selector/language-selector.component';
import { ThemeToggleComponent } from '../shared/theme-toggle/theme-toggle.component';
import { ServerSelectorComponent } from '../shared/server-selector/server-selector.component';
import { TenantSelectorComponent } from '../shared/tenant-selector/tenant-selector.component';
import { LoginFormComponent } from './login-form/login-form.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { TwoFactorAuthenticationComponent } from './two-factor-authentication/two-factor-authentication.component';
import { MatList, MatListItem } from '@angular/material/list';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { FooterComponent } from '../shared/footer/footer.component';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Login component.
 */
@Component({
  selector: 'mifosx-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    LanguageSelectorComponent,
    ThemeToggleComponent,
    ServerSelectorComponent,
    TenantSelectorComponent,
    LoginFormComponent,
    ResetPasswordComponent,
    TwoFactorAuthenticationComponent,
    MatList,
    MatListItem,
    MatMenuTrigger,
    FooterComponent,
    FaIconComponent,
    MatMenu,
    MatMenuItem
  ]
})
export class LoginComponent implements OnInit, OnDestroy {
  public environment = environment;

  /** True if password requires a reset. */
  resetPassword = false;
  /** True if user requires two factor authentication. */
  twoFactorAuthenticationRequired = false;
  /** Subscription to alerts. */
  alert$: Subscription;

  /**
   * @param {AlertService} alertService Alert Service.
   * @param {Router} router Router for navigation.
   */
  constructor(
    private alertService: AlertService,
    private settingsService: SettingsService,
    private router: Router
  ) {}

  /**
   * Subscribes to alert event of alert service.
   */
  ngOnInit() {
    this.alert$ = this.alertService.alertEvent.subscribe((alertEvent: Alert) => {
      const alertType = alertEvent.type;
      if (alertType === 'Password Expired') {
        this.twoFactorAuthenticationRequired = false;
        this.resetPassword = true;
      } else if (alertType === 'Two Factor Authentication Required') {
        this.resetPassword = false;
        this.twoFactorAuthenticationRequired = true;
      } else if (alertType === 'Authentication Success') {
        this.resetPassword = false;
        this.twoFactorAuthenticationRequired = false;
        this.router.navigate(['/'], { replaceUrl: true });
      }
    });
  }

  /**
   * Unsubscribes from alerts.
   */
  ngOnDestroy() {
    this.alert$.unsubscribe();
  }

  reloadSettings(): void {
    this.settingsService.setTenantIdentifier('');
    this.settingsService.setTenantIdentifier(environment.fineractPlatformTenantId || 'default');
    this.settingsService.setTenantIdentifiers(environment.fineractPlatformTenantIds.split(','));
    this.settingsService.setServers(environment.baseApiUrls.split(','));
    window.location.reload();
  }

  displayTenantSelector(): boolean {
    return environment.displayTenantSelector === 'false' ? false : true;
  }
}
