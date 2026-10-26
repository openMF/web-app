/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { EventEmitter } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, of } from 'rxjs';

import { AlertService } from '../core/alert/alert.service';
import { AuthenticationService } from '../core/authentication/authentication.service';
import { SettingsService } from '../settings/settings.service';
import { ThemingService } from '../shared/theme-toggle/theming.service';
import { VersionService } from '../system/version.service';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  function createComponent(options: { returnUrl?: string; authenticated?: boolean } = {}): {
    component: LoginComponent;
    router: { navigateByUrl: jest.Mock };
    alertService: { alertEvent: EventEmitter<any> };
  } {
    const router = { navigateByUrl: jest.fn() };
    const alertService = { alertEvent: new EventEmitter<any>() };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: router },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: { get: () => options.returnUrl ?? null } } }
        },
        { provide: AlertService, useValue: alertService },
        { provide: AuthenticationService, useValue: { isAuthenticated: () => options.authenticated ?? false } },
        {
          provide: SettingsService,
          useValue: { tenantIdentifier: 'default', themeDarkEnabled: false, server: 'https://localhost' }
        },
        {
          provide: ThemingService,
          useValue: { theme: new BehaviorSubject('light-theme'), setDarkMode: jest.fn() }
        },
        { provide: VersionService, useValue: { getBackendInfo: () => of({}) } },
        { provide: TranslateService, useValue: { instant: (key: string) => key } }
      ]
    });

    return { component: TestBed.runInInjectionContext(() => new LoginComponent()), router, alertService };
  }

  /** Emits the alert the authentication service raises on a successful login. */
  function emitLoginSuccess(alertService: { alertEvent: EventEmitter<any> }): void {
    alertService.alertEvent.emit({ type: 'errors.auth.success.type', message: 'welcome' });
  }

  it('should navigate to the preserved route after a successful login', () => {
    const { component, router, alertService } = createComponent({ returnUrl: '/clients' });
    component.ngOnInit();

    emitLoginSuccess(alertService);

    expect(router.navigateByUrl).toHaveBeenCalledWith('/clients', { replaceUrl: true });
  });

  it('should navigate to the dashboard when no return URL was preserved', () => {
    const { component, router, alertService } = createComponent();
    component.ngOnInit();

    emitLoginSuccess(alertService);

    expect(router.navigateByUrl).toHaveBeenCalledWith('/', { replaceUrl: true });
  });

  it('should fall back to the dashboard for an unsafe return URL', () => {
    const { component, router, alertService } = createComponent({ returnUrl: '//evil.example.com' });
    component.ngOnInit();

    emitLoginSuccess(alertService);

    expect(router.navigateByUrl).toHaveBeenCalledWith('/', { replaceUrl: true });
  });

  it('should not use the login page as a return destination', () => {
    const { component, router, alertService } = createComponent({ returnUrl: '/login' });
    component.ngOnInit();

    emitLoginSuccess(alertService);

    expect(router.navigateByUrl).toHaveBeenCalledWith('/', { replaceUrl: true });
  });

  it('should send an already authenticated visitor straight to the preserved route', () => {
    const { component, router } = createComponent({ returnUrl: '/clients', authenticated: true });

    component.ngOnInit();

    expect(router.navigateByUrl).toHaveBeenCalledWith('/clients', { replaceUrl: true });
  });

  it('should keep showing the password reset and two factor steps', () => {
    const { component, router, alertService } = createComponent({ returnUrl: '/clients' });
    component.ngOnInit();

    alertService.alertEvent.emit({ type: 'errors.auth.passwordExpired.type' });
    expect(component.resetPassword).toBe(true);
    expect(component.twoFactorAuthenticationRequired).toBe(false);

    alertService.alertEvent.emit({ type: 'errors.auth.twoFactor.type' });
    expect(component.resetPassword).toBe(false);
    expect(component.twoFactorAuthenticationRequired).toBe(true);

    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });
});
