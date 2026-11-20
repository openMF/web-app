/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { ApplicationRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, of } from 'rxjs';

import { ConnectionStatus } from 'app/core/connection/connection-status.model';
import { ConnectionStatusService } from 'app/core/connection/connection-status.service';
import { SystemInfoService, SystemInformation } from 'app/system/system-info.service';
import { MISSING_VALUE, parseFineractVersion, parseWebAppVersion } from 'app/system/system-info.utils';
import { SystemInfoPanelComponent, SystemInfoPanelMode } from '../system-info-panel/system-info-panel.component';
import { StatusBarComponent, retrySeconds, serverHost } from './status-bar.component';
import { StatusBarView } from './status-bar.model';

/** Stands in for the panel, which has its own spec, so only the bar's wiring is tested here. */
@Component({
  selector: 'mifosx-system-info-panel',
  template: `
    <button type="button" class="stub-close" (click)="closed.emit()"></button>
    <button type="button" class="stub-retry" (click)="retry.emit()"></button>
  `,
  host: { '[attr.data-mode]': 'mode', '[attr.data-state]': 'view.status.state' }
})
class SystemInfoPanelStubComponent {
  @Input() view: StatusBarView;
  @Input() mode: SystemInfoPanelMode;
  @Output() closed = new EventEmitter<void>();
  @Output() retry = new EventEmitter<void>();
}

describe('StatusBarComponent', () => {
  const now = new Date(2026, 10, 10, 23, 38, 27);
  const online: ConnectionStatus = { state: 'online', checkedAt: now, nextCheckAt: new Date(now.getTime() + 30000) };

  let fixture: ComponentFixture<StatusBarComponent>;
  let status$: BehaviorSubject<ConnectionStatus>;
  let compact$: BehaviorSubject<BreakpointState>;
  let checkNow: jest.Mock;
  let info: SystemInformation;
  let info$: BehaviorSubject<SystemInformation>;

  const element = (): HTMLElement => fixture.nativeElement;
  const bar = (): HTMLElement => element().querySelector('.status-bar');
  const text = (selector: string): string => element().querySelector(selector)?.textContent.trim();
  const setStatus = (status: ConnectionStatus) => {
    status$.next(status);
    fixture.detectChanges();
  };
  const setCompact = (matches: boolean) => {
    compact$.next({ matches, breakpoints: {} });
    fixture.detectChanges();
  };
  const details = (): HTMLButtonElement => element().querySelector('.details-button');
  const popover = (): HTMLElement =>
    document.querySelector('.cdk-overlay-container mifosx-system-info-panel[data-mode="popover"]');
  const sheet = (): HTMLElement => document.querySelector('mat-bottom-sheet-container');
  const click = (target: HTMLElement) => {
    target.click();
    fixture.detectChanges();
  };
  const pressEscape = () => {
    const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
    // The overlays read the legacy key code.
    Object.defineProperty(event, 'keyCode', { get: () => 27 });
    document.body.dispatchEvent(event);
    fixture.detectChanges();
  };
  /** Lets the bottom sheet finish opening or closing. */
  const settleSheet = () => {
    jest.runOnlyPendingTimers();
    fixture.detectChanges();
  };

  beforeEach(async () => {
    jest.useFakeTimers();
    jest.setSystemTime(now);
    status$ = new BehaviorSubject<ConnectionStatus>(online);
    compact$ = new BehaviorSubject<BreakpointState>({ matches: false, breakpoints: {} });
    checkNow = jest.fn();
    info = {
      webApp: parseWebAppVersion('261110', 'ged5a603', 'ed5a603c1f0e9d2b7a4c3e8f1d6b2a9c0e7f4d3b'),
      fineract: parseFineractVersion({
        git: { build: { version: '1.17.0-SNAPSHOT' }, commit: { id: { abbrev: '12e7559', full: '12e7559288' } } }
      }),
      server: 'https://apis.mifos.community',
      tenant: 'default',
      username: 'mifos',
      name: 'mifos',
      renderTime: now,
      businessDate: null
    };
    info$ = new BehaviorSubject(info);

    await TestBed.configureTestingModule({
      imports: [
        StatusBarComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        provideNoopAnimations(),
        { provide: ConnectionStatusService, useValue: { status$, checkNow } },
        { provide: SystemInfoService, useValue: { getSystemInformation: () => info$ } },
        {
          // The bottom sheet asks about its own breakpoints, which never match here.
          provide: BreakpointObserver,
          useValue: {
            observe: (query: string) =>
              query === StatusBarComponent.compactQuery ? compact$ : of({ matches: false, breakpoints: {} }),
            isMatched: () => false
          }
        }
      ]
    })
      .overrideComponent(StatusBarComponent, {
        remove: { imports: [SystemInfoPanelComponent] },
        add: { imports: [SystemInfoPanelStubComponent] }
      })
      .compileComponents();

    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', { labels: { text: { 'Retrying in seconds': 'Retrying in {{seconds}} s' } } });
    translate.use('en');

    fixture = TestBed.createComponent(StatusBarComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should show the connected state with the server host and the versions', () => {
    expect(bar().dataset.state).toBe('online');
    expect(text('.status-text')).toBe('labels.text.Connected');
    expect(text('.item-host')).toBe('apis.mifos.community');
    expect(text('.item-tenant .item-value')).toBe('default');
    expect(text('.item-user .item-value')).toBe('mifos');
    expect(text('.item-webapp .item-value')).toBe('261110');
    expect(text('.item-webapp .commit-hash-chip')).toBe('ed5a603');
    expect(text('.item-fineract .item-value')).toBe('1.17.0');
    expect(text('.item-render-time .item-value')).toBe('23:38:27');
  });

  it('should flag a pre-release backend with a badge, and a release with none', () => {
    expect(text('.item-fineract .pre-release-badge')).toBe('SNAPSHOT');

    info$.next({ ...info, fineract: parseFineractVersion({ git: { build: { version: '1.17.0' } } }) });
    fixture.detectChanges();

    expect(element().querySelector('.item-fineract .pre-release-badge')).toBeNull();
  });

  it('should show the server unreachable, the retry countdown and the server values as missing', () => {
    setStatus({ state: 'offline', checkedAt: now, nextCheckAt: new Date(now.getTime() + 18000) });

    expect(bar().dataset.state).toBe('offline');
    expect(text('.status-text')).toBe('labels.text.Server unreachable');
    expect(text('.item-retry span')).toBe('Retrying in 18 s');
    expect(text('.item-fineract .item-value')).toBe(MISSING_VALUE);
    expect(element().querySelector('.item-fineract .pre-release-badge')).toBeNull();

    jest.advanceTimersByTime(1000);
    fixture.detectChanges();

    expect(text('.item-retry span')).toBe('Retrying in 17 s');
  });

  it('should check immediately when Retry now is clicked', () => {
    setStatus({ state: 'offline', checkedAt: now, nextCheckAt: new Date(now.getTime() + 18000) });

    element().querySelector<HTMLButtonElement>('.item-retry button').click();

    expect(checkNow).toHaveBeenCalledTimes(1);
  });

  it('should show the checking state without a retry countdown', () => {
    setStatus({ state: 'checking', checkedAt: null, nextCheckAt: null });

    expect(bar().dataset.state).toBe('checking');
    expect(text('.status-text')).toBe('labels.text.Checking connection');
    expect(element().querySelector('.item-retry')).toBeNull();
  });

  it('should keep the status in a polite live region', () => {
    expect(element().querySelector('.status').getAttribute('aria-live')).toBe('polite');
  });

  it('should show a dash for every missing value', () => {
    info$.next({
      ...info,
      server: '',
      tenant: '',
      username: '',
      webApp: parseWebAppVersion('', ''),
      fineract: parseFineractVersion(null)
    });
    fixture.detectChanges();

    expect(text('.item-host')).toBe(MISSING_VALUE);
    expect(text('.item-tenant .item-value')).toBe(MISSING_VALUE);
    expect(text('.item-user .item-value')).toBe(MISSING_VALUE);
    expect(text('.item-webapp .item-value')).toBe(MISSING_VALUE);
    expect(element().querySelector('.commit-hash-chip')).toBeNull();
    expect(text('.item-fineract .item-value')).toBe(MISSING_VALUE);
  });

  it('should give every item that hides on narrow bars its own class, in hiding order', () => {
    const hidingOrder = [
      '.item-render-time',
      '.item-user',
      '.item-tenant',
      '.item-host',
      '.item-webapp'
    ];

    hidingOrder.forEach((selector) => expect(element().querySelector(selector)).not.toBeNull());
  });

  it('should show the compact bar on small screens', () => {
    setCompact(true);

    const compactBar = element().querySelector<HTMLButtonElement>('button.status-bar.compact');
    expect(compactBar).not.toBeNull();
    expect(text('.status-text')).toBe('labels.text.Connected');
    expect(compactBar.textContent).toContain('1.17.0');
    expect(compactBar.textContent).toContain('SNAPSHOT');
    expect(element().querySelector('.item-tenant')).toBeNull();
  });

  describe('System information panel', () => {
    afterEach(() => {
      // Leaves no overlay or bottom sheet open for the next test.
      document.querySelectorAll('.cdk-overlay-container').forEach((container) => (container.innerHTML = ''));
    });

    it('should open above the bar from Details, with the view the bar shows', () => {
      expect(details().getAttribute('aria-expanded')).toBe('false');
      expect(details().getAttribute('aria-controls')).toBe('system-information-panel');
      expect(popover()).toBeNull();

      click(details());

      expect(details().getAttribute('aria-expanded')).toBe('true');
      expect(details().classList).toContain('open');
      expect(popover().dataset.state).toBe('online');

      setStatus({ state: 'offline', checkedAt: now, nextCheckAt: null });

      expect(popover().dataset.state).toBe('offline');
    });

    it('should close from Details again', () => {
      click(details());
      click(details());

      expect(popover()).toBeNull();
      expect(details().getAttribute('aria-expanded')).toBe('false');
    });

    it('should close from its close button and give the focus back to Details', () => {
      click(details());

      click(popover().querySelector('.stub-close'));

      expect(popover()).toBeNull();
      expect(details().getAttribute('aria-expanded')).toBe('false');
      expect(document.activeElement).toBe(details());
    });

    it('should close on Escape and give the focus back to Details', () => {
      click(details());
      popover().querySelector<HTMLButtonElement>('.stub-close').focus();

      pressEscape();

      expect(popover()).toBeNull();
      expect(details().getAttribute('aria-expanded')).toBe('false');
      expect(document.activeElement).toBe(details());
    });

    it('should close on a click elsewhere and leave the focus where it went', () => {
      const elsewhere = document.createElement('button');
      document.body.appendChild(elsewhere);
      click(details());

      elsewhere.focus();
      click(elsewhere);

      expect(popover()).toBeNull();
      expect(details().getAttribute('aria-expanded')).toBe('false');
      expect(document.activeElement).toBe(elsewhere);
      elsewhere.remove();
    });

    it('should check again when Retry now is clicked in the panel', () => {
      setStatus({ state: 'offline', checkedAt: now, nextCheckAt: null });
      click(details());

      click(popover().querySelector('.stub-retry'));

      expect(checkNow).toHaveBeenCalledTimes(1);
    });

    it('should open as a labelled bottom sheet from anywhere on the compact bar', () => {
      setCompact(true);
      const compactBar = element().querySelector<HTMLButtonElement>('button.status-bar.compact');
      expect(compactBar.getAttribute('aria-controls')).toBe('system-information-panel');

      click(compactBar);
      settleSheet();

      expect(compactBar.getAttribute('aria-expanded')).toBe('true');
      expect(sheet().querySelector('mifosx-system-info-panel').getAttribute('data-mode')).toBe('sheet');
      expect(sheet().getAttribute('aria-label')).toBe('labels.heading.System Information');
      expect(popover()).toBeNull();
    });

    it('should close the bottom sheet from its close button', () => {
      setCompact(true);
      const compactBar = element().querySelector<HTMLButtonElement>('button.status-bar.compact');
      click(compactBar);
      settleSheet();

      click(sheet().querySelector('.stub-close'));
      settleSheet();

      expect(sheet()).toBeNull();
      expect(compactBar.getAttribute('aria-expanded')).toBe('false');
    });

    it('should close the bottom sheet when the bar is removed', () => {
      setCompact(true);
      click(element().querySelector<HTMLButtonElement>('button.status-bar.compact'));
      settleSheet();
      expect(sheet()).not.toBeNull();

      fixture.destroy();
      jest.runOnlyPendingTimers();
      TestBed.inject(ApplicationRef).tick();

      expect(sheet()).toBeNull();
    });

    it('should close when the bar switches between full and compact', () => {
      click(details());

      setCompact(true);

      expect(popover()).toBeNull();
      const compactBar = element().querySelector<HTMLButtonElement>('button.status-bar.compact');
      expect(compactBar.getAttribute('aria-expanded')).toBe('false');

      click(compactBar);
      settleSheet();
      setCompact(false);
      settleSheet();

      expect(sheet()).toBeNull();
      expect(details().getAttribute('aria-expanded')).toBe('false');
    });
  });
});

describe('serverHost', () => {
  it('should drop the protocol and any trailing slash', () => {
    expect(serverHost('https://apis.mifos.community')).toBe('apis.mifos.community');
    expect(serverHost('http://localhost:8443/')).toBe('localhost:8443');
    expect(serverHost('')).toBe('');
    expect(serverHost(null)).toBe('');
  });
});

describe('retrySeconds', () => {
  const now = new Date(2026, 10, 10, 23, 38, 27).getTime();

  it('should count whole seconds down to the next check while unreachable', () => {
    expect(retrySeconds({ state: 'offline', checkedAt: null, nextCheckAt: new Date(now + 17200) }, now)).toBe(18);
    expect(retrySeconds({ state: 'offline', checkedAt: null, nextCheckAt: new Date(now - 500) }, now)).toBe(0);
  });

  it('should have no countdown otherwise', () => {
    expect(retrySeconds({ state: 'online', checkedAt: null, nextCheckAt: new Date(now + 1000) }, now)).toBeNull();
    expect(retrySeconds({ state: 'offline', checkedAt: null, nextCheckAt: null }, now)).toBeNull();
  });
});
