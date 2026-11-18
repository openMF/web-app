/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatTooltip } from '@angular/material/tooltip';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

import { ConnectionState, ConnectionStatus } from 'app/core/connection/connection-status.model';
import { ConnectionStatusService } from 'app/core/connection/connection-status.service';
import { ComponentVersion, SystemInfoService } from 'app/system/system-info.service';
import { MISSING_VALUE, parseFineractVersion } from 'app/system/system-info.utils';
import { environment } from '../../../environments/environment';
import { ConnectionCardComponent } from './connection-card.component';

describe('ConnectionCardComponent', () => {
  const storageKey = ConnectionCardComponent.expandedStorageKey;

  let fixture: ComponentFixture<ConnectionCardComponent>;
  let status$: BehaviorSubject<ConnectionStatus>;
  let fineract$: Observable<ComponentVersion>;
  let checkNow: jest.Mock;
  let getFineractVersion: jest.Mock;

  const element = (): HTMLElement => fixture.nativeElement;
  const text = (selector: string): string => element().querySelector(selector)?.textContent.trim();
  const card = (): HTMLElement => element().querySelector('.connection-card');
  const toggle = (): HTMLButtonElement => element().querySelector('button.toggle');
  const values = (): string[] => Array.from(element().querySelectorAll('dd')).map((dd) => dd.textContent.trim());
  const setState = (state: ConnectionState) => {
    status$.next({ state, checkedAt: state === 'checking' ? null : new Date(), nextCheckAt: null });
    fixture.detectChanges();
  };
  const setInputs = (inputs: { server?: string | null; tenant?: string | null }) => {
    Object.entries(inputs).forEach(
      ([
        name,
        value
      ]) => fixture.componentRef.setInput(name, value)
    );
    fixture.detectChanges();
  };

  function createCard(): void {
    fixture = TestBed.createComponent(ConnectionCardComponent);
    setInputs({ server: 'https://apis.mifos.community/', tenant: 'default' });
  }

  /** The test setup stubs local storage, so it is backed by a map here. */
  const storage = new Map<string, string>();
  const getItem = localStorage.getItem as jest.Mock;
  const setItem = localStorage.setItem as jest.Mock;

  beforeEach(async () => {
    storage.clear();
    getItem.mockImplementation((key: string) => storage.get(key) ?? null);
    setItem.mockImplementation((key: string, value: string) => storage.set(key, value));
    status$ = new BehaviorSubject<ConnectionStatus>({ state: 'checking', checkedAt: null, nextCheckAt: null });
    fineract$ = new BehaviorSubject(parseFineractVersion({ git: { build: { version: '1.11.0' } } }));
    checkNow = jest.fn();
    getFineractVersion = jest.fn(() => fineract$);

    await TestBed.configureTestingModule({
      imports: [
        ConnectionCardComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        provideNoopAnimations(),
        { provide: ConnectionStatusService, useValue: { status$, checkNow } },
        { provide: SystemInfoService, useValue: { getFineractVersion } }
      ]
    }).compileComponents();
  });

  afterEach(() => {
    getItem.mockReset();
    setItem.mockReset();
  });

  describe('status', () => {
    beforeEach(() => createCard());

    it('shows the checking state until the first check completes', () => {
      expect(card().dataset['state']).toBe('checking');
      expect(text('.status-text')).toBe('labels.text.Checking connection');
    });

    it('shows a reachable server as online', () => {
      setState('online');

      expect(card().dataset['state']).toBe('online');
      expect(text('.status-text')).toBe('labels.text.Server reachable');
    });

    it('shows an unreachable server as offline', () => {
      setState('offline');

      expect(card().dataset['state']).toBe('offline');
      expect(text('.status-text')).toBe('labels.text.Server unreachable');
    });

    it('follows the server going down and coming back', () => {
      setState('online');
      setState('offline');
      expect(text('.status-text')).toBe('labels.text.Server unreachable');

      setState('online');
      expect(text('.status-text')).toBe('labels.text.Server reachable');
    });

    it('announces the status politely, in text as well as colour', () => {
      const status = element().querySelector('.status-text');
      expect(status.getAttribute('aria-live')).toBe('polite');
      expect(element().querySelector('.status-dot').getAttribute('aria-hidden')).toBe('true');
    });
  });

  describe('details', () => {
    beforeEach(() => createCard());

    it('shows the server host without its protocol and the full URL as the tooltip', () => {
      const server = element().querySelector('dd');
      expect(server.textContent.trim()).toBe('apis.mifos.community');
      expect(server.getAttribute('tabindex')).toBe('0');
      const tooltip = fixture.debugElement.query(By.directive(MatTooltip)).injector.get(MatTooltip);
      expect(tooltip.message).toBe('https://apis.mifos.community/');
    });

    it('shows the tenant, the web app version and the Fineract version', () => {
      setState('online');

      expect(values()).toEqual([
        'apis.mifos.community',
        'default',
        environment.version || MISSING_VALUE,
        '1.11.0'
      ]);
    });

    it('updates the tenant as soon as another one is selected', () => {
      setInputs({ tenant: 'synthetic-tenant' });

      expect(values()[1]).toBe('synthetic-tenant');
    });

    it('shows a dash for every missing value', () => {
      fineract$ = new BehaviorSubject(parseFineractVersion(null));
      fixture.destroy();
      createCard();
      setInputs({ server: '', tenant: null });
      setState('online');

      expect(values()[0]).toBe(MISSING_VALUE);
      expect(values()[1]).toBe(MISSING_VALUE);
      expect(values()[3]).toBe(MISSING_VALUE);
    });

    it('shows the Fineract version as a dash while the server is unreachable', () => {
      setState('offline');
      expect(values()[3]).toBe(MISSING_VALUE);

      setState('online');
      expect(values()[3]).toBe('1.11.0');
    });

    it('asks for the Fineract version only once the server answers, and again after a return online', () => {
      expect(getFineractVersion).not.toHaveBeenCalled();
      expect(values()[3]).toBe(MISSING_VALUE);

      setState('online');
      expect(getFineractVersion).toHaveBeenCalledTimes(1);

      setState('offline');
      expect(getFineractVersion).toHaveBeenCalledTimes(1);

      setState('online');
      expect(getFineractVersion).toHaveBeenCalledTimes(2);
      expect(values()[3]).toBe('1.11.0');
    });

    it('does not ask again for a status update that is not a new check', () => {
      setState('online');
      status$.next({ ...status$.value, nextCheckAt: new Date() });
      fixture.detectChanges();

      expect(getFineractVersion).toHaveBeenCalledTimes(1);
    });

    it('reads the Fineract version again on the next check after a failed read', () => {
      fineract$ = of(parseFineractVersion(null));
      setState('online');
      expect(values()[3]).toBe(MISSING_VALUE);

      fineract$ = of(parseFineractVersion({ git: { build: { version: '1.12.0' } } }));
      setState('online');

      expect(values()[3]).toBe('1.12.0');
    });

    it('checks a newly selected server straight away, but not the first one', () => {
      expect(checkNow).not.toHaveBeenCalled();

      setInputs({ server: 'https://other.example.org' });

      expect(checkNow).toHaveBeenCalledTimes(1);
      expect(values()[0]).toBe('other.example.org');
    });
  });

  describe('collapse', () => {
    it('is expanded by default', () => {
      createCard();

      expect(card().classList).toContain('expanded');
      // Never a submit button: Enter or Space on the chevron must not submit the login form.
      expect(toggle().type).toBe('button');
      expect(toggle().getAttribute('aria-expanded')).toBe('true');
      expect(toggle().getAttribute('aria-label')).toBe('labels.buttons.Hide connection details');
      expect(toggle().getAttribute('aria-controls')).toBe(element().querySelector('.details').id);
    });

    it('collapses and expands the details while the header stays visible', () => {
      createCard();

      toggle().click();
      fixture.detectChanges();
      expect(card().classList).not.toContain('expanded');
      expect(toggle().getAttribute('aria-expanded')).toBe('false');
      expect(toggle().getAttribute('aria-label')).toBe('labels.buttons.Show connection details');
      expect(text('.status-text')).toBe('labels.text.Checking connection');

      toggle().click();
      fixture.detectChanges();
      expect(card().classList).toContain('expanded');
      expect(toggle().getAttribute('aria-expanded')).toBe('true');
    });

    it('remembers the choice for the next visit', () => {
      createCard();
      toggle().click();
      fixture.detectChanges();
      expect(storage.get(storageKey)).toBe('false');

      fixture.destroy();
      createCard();

      expect(card().classList).not.toContain('expanded');
    });

    it('still works when local storage is unavailable', () => {
      const blocked = () => {
        throw new DOMException('blocked', 'SecurityError');
      };
      getItem.mockImplementation(blocked);
      setItem.mockImplementation(blocked);
      createCard();
      expect(card().classList).toContain('expanded');

      toggle().click();
      fixture.detectChanges();

      expect(card().classList).not.toContain('expanded');
    });
  });
});
