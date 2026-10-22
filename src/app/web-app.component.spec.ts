/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { of, Subject } from 'rxjs';

import { AlertService } from 'app/core/alert/alert.service';
import { ThemeStorageService } from 'app/shared/theme-picker/theme-storage.service';
import { Dates } from 'app/core/utils/dates';
import { IdleTimeoutService } from 'app/home/timeout-dialog/idle-timeout.service';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { SettingsService } from 'app/settings/settings.service';
import { DocumentationLinksService } from 'app/shared/services/documentation-links.service';
import { ThemingService } from 'app/shared/theme-toggle/theming.service';
import { LogoutDialogComponent } from 'app/shared/logout-dialog/logout-dialog.component';
import { SessionTimeoutDialogComponent } from './home/timeout-dialog/session-timeout-dialog.component';
import { WebAppComponent } from './web-app.component';

/* The component under test pulls in a large dependency graph; each dependency
   is replaced by a focused mock so the logout confirmation gate can be
   exercised in isolation. */

const mockDialogOpen = jest.fn();
const sessionTimeout$ = new Subject<void>();

const mockRouter = {
  navigate: jest.fn(),
  events: of([]),
  url: '/home',
  routeReuseStrategy: {},
  onSameUrlNavigation: 'ignore'
} as any;

const mockActivatedRoute = { outlet: 'primary', firstChild: null, data: of({}) } as any;
const mockTitle = { setTitle: jest.fn() } as any;
const mockTranslateService = {
  addLangs: jest.fn(),
  use: jest.fn(),
  instant: jest.fn((key: string) => key),
  onLangChange: new Subject()
} as any;
const mockSnackBar = { open: jest.fn() } as any;
const mockAlertService = { alert: jest.fn(), alertEvent: new Subject() } as any;

const mockSettingsService = {
  themeDarkEnabled: false,
  language: null,
  languageCode: 'en-US',
  servers: ['/fineract-provider'],
  setDefaultLanguage: jest.fn(),
  setBusinessDate: jest.fn(),
  setServers: jest.fn(),
  setTenantIdentifier: jest.fn(),
  setTenantIdentifiers: jest.fn()
} as any;

const mockAuthenticationService = {
  logout: jest.fn(() => of(true)),
  isAuthenticated$: of(true)
} as any;

const mockThemeStorageService = { loadTenantTheme: jest.fn() } as any;
const mockDates = { formatDate: jest.fn(() => '14 October 2026') } as any;
const mockIdle = { start: jest.fn(), stop: jest.fn(), $onSessionTimeout: sessionTimeout$ } as any;
const mockMatDialog = { open: mockDialogOpen } as any;
const mockDocumentationLinks = { open: jest.fn() } as any;
const mockThemingService = {
  theme: of(''),
  setInitialDarkMode: jest.fn(),
  setDarkMode: jest.fn()
} as any;

const testingModuleMetadata = {
  imports: [TranslateModule.forRoot()],
  providers: [
    { provide: Router, useValue: mockRouter },
    { provide: ActivatedRoute, useValue: mockActivatedRoute },
    { provide: Title, useValue: mockTitle },
    { provide: TranslateService, useValue: mockTranslateService },
    { provide: MatSnackBar, useValue: mockSnackBar },
    { provide: AlertService, useValue: mockAlertService },
    { provide: ThemeStorageService, useValue: mockThemeStorageService },
    { provide: Dates, useValue: mockDates },
    { provide: IdleTimeoutService, useValue: mockIdle },
    { provide: AuthenticationService, useValue: mockAuthenticationService },
    { provide: SettingsService, useValue: mockSettingsService },
    { provide: ThemingService, useValue: mockThemingService },
    { provide: DocumentationLinksService, useValue: mockDocumentationLinks },
    { provide: MatDialog, useValue: mockMatDialog }
  ],
  declarations: [WebAppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
};

describe('WebAppComponent — logout confirmation gate', () => {
  let fixture: ComponentFixture<WebAppComponent>;
  let component: WebAppComponent;

  beforeEach(async () => {
    mockDialogOpen.mockReturnValue({ afterClosed: () => of(true) });

    await TestBed.configureTestingModule(testingModuleMetadata).compileComponents();

    fixture = TestBed.createComponent(WebAppComponent);
    component = fixture.componentInstance;
    jest.spyOn(component, 'logout').mockImplementation(() => {});
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('confirmLogout opens LogoutDialogComponent and logs out when confirmed', () => {
    component.confirmLogout();

    expect(mockDialogOpen).toHaveBeenCalledWith(LogoutDialogComponent);
    expect(mockDialogOpen).toHaveBeenCalledTimes(1);
    expect(component.logout).toHaveBeenCalledTimes(1);
  });

  it('preserves the session when the dialog is confirmed false', () => {
    mockDialogOpen.mockReturnValueOnce({ afterClosed: () => of(false) });

    component.confirmLogout();

    expect(mockDialogOpen).toHaveBeenCalledWith(LogoutDialogComponent);
    expect(component.logout).not.toHaveBeenCalled();
  });

  it('preserves the session when the dialog is dismissed (undefined)', () => {
    mockDialogOpen.mockReturnValueOnce({ afterClosed: () => of(undefined) });

    component.confirmLogout();

    expect(component.logout).not.toHaveBeenCalled();
  });

  it('routes the Ctrl+L keyboard shortcut through confirmLogout', () => {
    component.buttonConfig = {
      buttonCombinations: [
        {
          title: 'Logout',
          ctrlKey: true,
          shiftKey: false,
          altKey: false,
          key: 'l',
          route: '',
          id: 'logout'
        }
      ]
    } as any;

    component.onKeydownHandler({ ctrlKey: true, shiftKey: false, altKey: false, key: 'l' } as KeyboardEvent);

    expect(mockDialogOpen).toHaveBeenCalledWith(LogoutDialogComponent);
    expect(component.logout).toHaveBeenCalledTimes(1);
  });

  it('keeps the automatic session-expiry logout free of the confirmation dialog', () => {
    jest.useFakeTimers();

    sessionTimeout$.next();
    jest.advanceTimersByTime(1000);

    // The timeout shows its own dialog and then logs out directly.
    expect(mockDialogOpen).toHaveBeenCalledWith(SessionTimeoutDialogComponent);
    expect(mockDialogOpen).not.toHaveBeenCalledWith(LogoutDialogComponent);
    expect(component.logout).toHaveBeenCalledTimes(1);

    jest.useRealTimers();
  });
});
