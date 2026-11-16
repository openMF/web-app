/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { InteractivityChecker } from '@angular/cdk/a11y';
import { Clipboard } from '@angular/cdk/clipboard';
import { DatePipe } from '@angular/common';
import { ApplicationRef, Injectable } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { AlertService } from 'app/core/alert/alert.service';
import { ConnectionStatus } from 'app/core/connection/connection-status.model';
import { SettingsService } from 'app/settings/settings.service';
import { SystemInformation } from 'app/system/system-info.service';
import { MISSING_VALUE, parseFineractVersion, parseWebAppVersion } from 'app/system/system-info.utils';
import { environment } from 'environments/environment';
import { StatusBarView } from '../status-bar/status-bar.model';
import { SystemInfoPanelComponent, SystemInfoPanelMode, secondsSince } from './system-info-panel.component';

/** jsdom has no layout, so no element would count as visible, and so as focusable, for the focus trap. */
@Injectable()
class LayoutlessInteractivityChecker extends InteractivityChecker {
  override isVisible(): boolean {
    return true;
  }
}

describe('SystemInfoPanelComponent', () => {
  const now = new Date(2026, 10, 10, 23, 38, 27);
  const checkedAt = new Date(now.getTime() - 12000);
  const snapshot = parseFineractVersion({
    git: { build: { version: '1.17.0-SNAPSHOT' }, commit: { id: { abbrev: '12e7559', full: '12e7559288' } } }
  });
  const info: SystemInformation = {
    webApp: parseWebAppVersion('261110', 'ged5a603', 'ed5a603c1f0e9d2b7a4c3e8f1d6b2a9c0e7f4d3b'),
    fineract: snapshot,
    server: 'https://apis.mifos.community',
    tenant: 'default',
    username: 'mifos',
    name: 'Mifos Admin',
    renderTime: new Date(2026, 10, 10, 23, 30, 5),
    businessDate: null
  };

  let fixture: ComponentFixture<SystemInfoPanelComponent>;
  let copy: jest.Mock;
  let alert: jest.Mock;
  let reportIssueUrl: string;

  const element = (): HTMLElement => fixture.nativeElement;
  const text = (selector: string): string | undefined =>
    element().querySelector(selector)?.textContent.replace(/\s+/g, ' ').trim();
  const rowValue = (label: string): string | undefined => {
    const row = Array.from(element().querySelectorAll('.row')).find(
      (candidate) => candidate.querySelector('dt').textContent.trim() === label
    );
    return row?.querySelector('dd').textContent.replace(/\s+/g, ' ').trim();
  };
  const view = (status: Partial<ConnectionStatus> = {}, fineract = snapshot): StatusBarView => {
    const state = status.state ?? 'online';
    return {
      status: { state, checkedAt, nextCheckAt: null, ...status },
      info,
      host: 'apis.mifos.community',
      fineract: state === 'offline' ? null : fineract,
      retryIn: null,
      compact: false
    };
  };
  const render = (panelView: StatusBarView, mode: SystemInfoPanelMode = 'popover') => {
    fixture = TestBed.createComponent(SystemInfoPanelComponent);
    fixture.componentRef.setInput('view', panelView);
    fixture.componentRef.setInput('mode', mode);
    fixture.detectChanges();
  };

  beforeEach(async () => {
    jest.useFakeTimers();
    jest.setSystemTime(now);
    copy = jest.fn().mockReturnValue(true);
    alert = jest.fn();
    reportIssueUrl = environment.reportIssueUrl;

    await TestBed.configureTestingModule({
      imports: [
        SystemInfoPanelComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        DatePipe,
        { provide: InteractivityChecker, useClass: LayoutlessInteractivityChecker },
        { provide: Clipboard, useValue: { copy } },
        { provide: AlertService, useValue: { alert } },
        {
          provide: SettingsService,
          useValue: { datetimeFormat: 'dd MMMM yyyy HH:mm:ss', language: { name: 'English', code: 'en' } }
        }
      ]
    }).compileComponents();

    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', {
      labels: {
        text: {
          'Checked seconds ago': 'Checked {{seconds}} s ago',
          'Diagnostics copied': 'Diagnostics copied to the clipboard'
        }
      }
    });
    translate.use('en');
  });

  afterEach(() => {
    environment.reportIssueUrl = reportIssueUrl;
    jest.useRealTimers();
  });

  it('should show the connection, the versions and the session', () => {
    render(view());

    expect(text('.status-row .status-text')).toBe('labels.text.Connected');
    expect(rowValue('labels.version.Server')).toBe('https://apis.mifos.community');
    expect(rowValue('labels.version.Tenant')).toBe('default');
    expect(rowValue('labels.version.Mifos WebApp')).toBe('261110 ed5a603');
    expect(text('.row-webapp .commit-hash-chip')).toBe('ed5a603');
    expect(rowValue('labels.version.Apache Fineract')).toBe('1.17.0 SNAPSHOT');
    expect(rowValue('labels.version.Username')).toBe('mifos');
    expect(rowValue('labels.version.Name')).toBe('Mifos Admin');
  });

  it("should show the render time in the user's date and time format", () => {
    render(view());

    expect(rowValue('labels.version.Render Time')).toBe('10 November 2026 23:30:05');
  });

  it('should count the seconds since the last check every second', () => {
    render(view());
    expect(text('.checked-ago')).toBe('Checked 12 s ago');

    jest.advanceTimersByTime(3000);
    fixture.detectChanges();

    expect(text('.checked-ago')).toBe('Checked 15 s ago');
  });

  it('should warn about a pre-release backend, and not about a release', () => {
    render(view());
    expect(text('.pre-release-notice')).toContain('labels.text.Pre-release backend');

    render(view({}, parseFineractVersion({ git: { build: { version: '1.17.0' } } })));

    expect(element().querySelector('.pre-release-notice')).toBeNull();
    expect(element().querySelector('.row-fineract .pre-release-badge')).toBeNull();
  });

  it('should show the server unreachable with Retry now, and the Fineract version as missing', () => {
    render(view({ state: 'offline' }));
    const retry = jest.fn();
    fixture.componentInstance.retry.subscribe(retry);

    expect(text('.status-row .status-text')).toBe('labels.text.Server unreachable');
    expect(text('.checked-ago')).toBe('Checked 12 s ago');
    expect(rowValue('labels.version.Apache Fineract')).toBe(MISSING_VALUE);
    expect(element().querySelector('.pre-release-notice')).toBeNull();

    element().querySelector<HTMLButtonElement>('.retry-button').click();

    expect(retry).toHaveBeenCalledTimes(1);
  });

  it('should show neither the last check nor Retry now while checking', () => {
    render(view({ state: 'checking' }));

    expect(text('.status-row .status-text')).toBe('labels.text.Checking connection');
    expect(element().querySelector('.checked-ago')).toBeNull();
    expect(element().querySelector('.retry-button')).toBeNull();
  });

  it('should show a dash for every missing value', () => {
    render({
      ...view(),
      info: { ...info, server: '', tenant: '', username: '', name: '', webApp: parseWebAppVersion('', '') },
      fineract: parseFineractVersion(null)
    });

    [
      'labels.version.Server',
      'labels.version.Tenant',
      'labels.version.Mifos WebApp',
      'labels.version.Apache Fineract',
      'labels.version.Username',
      'labels.version.Name'
    ].forEach((label) => expect(rowValue(label)).toBe(MISSING_VALUE));
    expect(element().querySelector('.commit-hash-chip')).toBeNull();
  });

  it('should copy the diagnostics exactly as shown and confirm it', () => {
    render(view({ state: 'offline' }));

    element().querySelector<HTMLButtonElement>('.copy-button').click();

    const copied: string = copy.mock.calls[0][0];
    expect(copied.split('\n')).toEqual([
      'Mifos X WebApp: 261110 (ed5a603)',
      `Apache Fineract: ${MISSING_VALUE}`,
      'Server: https://apis.mifos.community',
      'Tenant: default',
      'Username: mifos',
      'Name: Mifos Admin',
      'Status: Server unreachable (checked 2026-11-10 23:38:15)',
      expect.stringMatching(/^Rendered: 2026-11-10 23:30:05 \(UTC[+-]\d{2}:\d{2}\)$/),
      `User agent: ${navigator.userAgent}`
    ]);
    expect(alert).toHaveBeenCalledWith({ type: 'success', message: 'Diagnostics copied to the clipboard' });
  });

  it('should not confirm the copy when the clipboard refuses it', () => {
    copy.mockReturnValue(false);
    render(view());

    element().querySelector<HTMLButtonElement>('.copy-button').click();

    expect(alert).not.toHaveBeenCalled();
  });

  it('should hide Report issue when no link is configured', () => {
    environment.reportIssueUrl = '';
    render(view());

    expect(element().querySelector('.report-button')).toBeNull();
  });

  it('should open the configured Report issue link in a new tab', () => {
    environment.reportIssueUrl = 'https://issues.example.org/new';
    render(view());

    const link = element().querySelector<HTMLAnchorElement>('.report-button');
    expect(link.href).toBe('https://issues.example.org/new');
    expect(link.target).toBe('_blank');
    expect(link.rel).toBe('noopener noreferrer');
  });

  it('should tell when the close button is clicked', () => {
    render(view());
    const closed = jest.fn();
    fixture.componentInstance.closed.subscribe(closed);

    const close = element().querySelector<HTMLButtonElement>('.close-button');
    expect(close.getAttribute('aria-label')).toBe('labels.buttons.Close');
    close.click();

    expect(closed).toHaveBeenCalledTimes(1);
  });

  it('should be a labelled dialog that takes the focus as a popover', () => {
    render(view());
    TestBed.inject(ApplicationRef).tick();

    const panel = element().querySelector('.panel');
    expect(panel.id).toBe('system-information-panel');
    expect(panel.getAttribute('role')).toBe('dialog');
    expect(element().querySelector(`#${panel.getAttribute('aria-labelledby')}`).textContent).toBe(
      'labels.heading.System Information'
    );
    expect(document.activeElement).toBe(element().querySelector('.close-button'));
  });

  it('should leave the dialog role and the focus to the bottom sheet in a sheet', () => {
    render(view(), 'sheet');
    TestBed.inject(ApplicationRef).tick();

    const panel = element().querySelector('.panel');
    expect(panel.id).toBe('system-information-panel');
    expect(panel.getAttribute('role')).toBeNull();
    expect(panel.getAttribute('aria-labelledby')).toBeNull();
    expect(element().classList).toContain('sheet');
    expect(document.activeElement).not.toBe(element().querySelector('.close-button'));
  });
});

describe('secondsSince', () => {
  const now = new Date(2026, 10, 10, 23, 38, 27).getTime();

  it('should count whole seconds since the date', () => {
    expect(secondsSince(new Date(now - 12900), now)).toBe(12);
    expect(secondsSince(new Date(now + 500), now)).toBe(0);
  });

  it('should have nothing to count without a date', () => {
    expect(secondsSince(null, now)).toBeNull();
  });
});
