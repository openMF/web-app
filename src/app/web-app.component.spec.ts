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

/** Dispatch a real keydown event on a detached target without reaching the window listener. */
function keydown(target: EventTarget, init: KeyboardEventInit): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init });
  target.dispatchEvent(event);
  return event;
}

describe('WebAppComponent', () => {
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

  it('routes a configured logout shortcut through confirmLogout', () => {
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

    const event = keydown(document.createElement('div'), { ctrlKey: true, key: 'l', code: 'KeyL' });
    component.onKeydownHandler(event);

    expect(mockDialogOpen).toHaveBeenCalledWith(LogoutDialogComponent);
    expect(component.logout).toHaveBeenCalledTimes(1);
    expect(event.defaultPrevented).toBe(true);
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

  describe('global keyboard shortcuts', () => {
    it('runs a configured shortcut from a non-editable target and suppresses its default', () => {
      const event = keydown(document.createElement('div'), {
        ctrlKey: true,
        altKey: true,
        key: 'n',
        code: 'KeyN'
      });

      component.onKeydownHandler(event);

      expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['navigation'], { relativeTo: mockActivatedRoute });
      expect(event.defaultPrevented).toBe(true);
    });

    it.each([
      'input',
      'textarea',
      'select',
      'mat-select'
    ])('ignores shortcuts from a %s', (tagName) => {
      const event = keydown(document.createElement(tagName), {
        ctrlKey: true,
        altKey: true,
        key: 'n',
        code: 'KeyN'
      });

      component.onKeydownHandler(event);

      expect(mockRouter.navigate).not.toHaveBeenCalled();
      expect(event.defaultPrevented).toBe(false);
    });

    it('ignores shortcuts from an ARIA textbox', () => {
      const target = document.createElement('div');
      target.setAttribute('role', 'textbox');

      const event = keydown(target, { ctrlKey: true, altKey: true, key: 'n', code: 'KeyN' });
      component.onKeydownHandler(event);

      expect(mockRouter.navigate).not.toHaveBeenCalled();
      expect(event.defaultPrevented).toBe(false);
    });

    it('ignores shortcuts from contenteditable elements and their descendants', () => {
      const editable = document.createElement('div');
      editable.setAttribute('contenteditable', 'true');
      const child = document.createElement('span');
      editable.appendChild(child);

      const editableEvent = keydown(editable, { ctrlKey: true, altKey: true, key: 'n', code: 'KeyN' });
      component.onKeydownHandler(editableEvent);

      const childEvent = keydown(child, { ctrlKey: true, altKey: true, key: 'n', code: 'KeyN' });
      component.onKeydownHandler(childEvent);

      expect(mockRouter.navigate).not.toHaveBeenCalled();
      expect(editableEvent.defaultPrevented).toBe(false);
      expect(childEvent.defaultPrevented).toBe(false);
    });

    it('does not treat contenteditable=false content as editable', () => {
      const target = document.createElement('div');
      target.setAttribute('contenteditable', 'false');

      const event = keydown(target, { ctrlKey: true, altKey: true, key: 'n', code: 'KeyN' });
      component.onKeydownHandler(event);

      expect(mockRouter.navigate).toHaveBeenCalledWith(['navigation'], { relativeTo: mockActivatedRoute });
      expect(event.defaultPrevented).toBe(true);
    });

    it('matches a macOS Option-modified key by its physical code', () => {
      const event = keydown(document.createElement('div'), {
        ctrlKey: true,
        altKey: true,
        key: 'ç',
        code: 'KeyC'
      });

      component.onKeydownHandler(event);

      expect(mockRouter.navigate).toHaveBeenCalledWith(['clients/create'], { relativeTo: mockActivatedRoute });
      expect(event.defaultPrevented).toBe(true);
    });

    it('does not suppress unrelated keydown events', () => {
      const event = keydown(document.createElement('div'), {
        ctrlKey: true,
        altKey: true,
        key: 'z',
        code: 'KeyZ'
      });

      component.onKeydownHandler(event);

      expect(mockRouter.navigate).not.toHaveBeenCalled();
      expect(event.defaultPrevented).toBe(false);
    });

    it('does not handle the browser-reserved bare Ctrl combination', () => {
      const event = keydown(document.createElement('div'), {
        ctrlKey: true,
        key: 'n',
        code: 'KeyN'
      });

      component.onKeydownHandler(event);

      expect(mockRouter.navigate).not.toHaveBeenCalled();
      expect(event.defaultPrevented).toBe(false);
    });

    it('does not match a shortcut when Meta is also pressed', () => {
      const event = keydown(document.createElement('div'), {
        ctrlKey: true,
        altKey: true,
        metaKey: true,
        key: 'n',
        code: 'KeyN'
      });

      component.onKeydownHandler(event);

      expect(mockRouter.navigate).not.toHaveBeenCalled();
      expect(event.defaultPrevented).toBe(false);
    });

    it('handles a missing Run Report target without throwing', () => {
      const event = keydown(document.createElement('div'), {
        ctrlKey: true,
        altKey: true,
        key: 'p',
        code: 'KeyP'
      });

      expect(document.getElementById('runreport')).toBeNull();
      expect(() => component.onKeydownHandler(event)).not.toThrow();
      expect(event.defaultPrevented).toBe(true);
    });

    it('clicks the Run Report target when it is present', () => {
      const runReportButton = document.createElement('button');
      runReportButton.id = 'runreport';
      document.body.appendChild(runReportButton);
      const click = jest.spyOn(runReportButton, 'click').mockImplementation(() => {});

      try {
        const event = keydown(document.createElement('div'), {
          ctrlKey: true,
          altKey: true,
          key: 'p',
          code: 'KeyP'
        });

        component.onKeydownHandler(event);

        expect(click).toHaveBeenCalledTimes(1);
        expect(event.defaultPrevented).toBe(true);
      } finally {
        runReportButton.remove();
      }
    });

    /* The character the operator sees must win over the physical key, otherwise a
       layout whose KeyS produces "o" would run the earlier "s" entry (submit). */
    it('prefers the typed key over a code match belonging to another action', () => {
      component.buttonConfig = {
        buttonCombinations: [
          {
            title: 'Save/Submit Forms',
            ctrlKey: true,
            shiftKey: false,
            altKey: true,
            key: 's',
            route: '',
            id: 'submit'
          },
          { title: 'Logout', ctrlKey: true, shiftKey: false, altKey: true, key: 'o', route: '', id: 'logout' }
        ]
      } as any;

      const submitButton = document.createElement('button');
      submitButton.textContent = 'Submit';
      document.body.appendChild(submitButton);
      const submitClick = jest.spyOn(submitButton, 'click').mockImplementation(() => {});

      try {
        const event = keydown(document.createElement('div'), {
          ctrlKey: true,
          altKey: true,
          key: 'o',
          code: 'KeyS'
        });

        component.onKeydownHandler(event);

        expect(mockDialogOpen).toHaveBeenCalledWith(LogoutDialogComponent);
        expect(submitClick).not.toHaveBeenCalled();
        expect(event.defaultPrevented).toBe(true);
      } finally {
        submitButton.remove();
      }
    });

    it('falls back to the physical code only when the key is not a Latin letter', () => {
      component.buttonConfig = {
        buttonCombinations: [
          {
            title: 'Save/Submit Forms',
            ctrlKey: true,
            shiftKey: false,
            altKey: true,
            key: 's',
            route: '',
            id: 'submit'
          },
          { title: 'Logout', ctrlKey: true, shiftKey: false, altKey: true, key: 'o', route: '', id: 'logout' }
        ]
      } as any;

      const submitButton = document.createElement('button');
      submitButton.textContent = 'Submit';
      document.body.appendChild(submitButton);
      const submitClick = jest.spyOn(submitButton, 'click').mockImplementation(() => {});

      try {
        // Option+O on macOS reports a non-Latin character, so the code decides.
        const event = keydown(document.createElement('div'), {
          ctrlKey: true,
          altKey: true,
          key: 'ø',
          code: 'KeyO'
        });

        component.onKeydownHandler(event);

        expect(mockDialogOpen).toHaveBeenCalledWith(LogoutDialogComponent);
        expect(submitClick).not.toHaveBeenCalled();
        expect(event.defaultPrevented).toBe(true);
      } finally {
        submitButton.remove();
      }
    });
  });
});
