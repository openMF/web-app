/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';

import { HomeComponent } from './home.component';
import { AuthenticationService } from '../core/authentication/authentication.service';
import { ConfigurationWizardService } from '../configuration-wizard/configuration-wizard.service';
import { PopoverService } from '../configuration-wizard/popover/popover.service';
import { SettingsService } from 'app/settings/settings.service';

/**
 * The Search Activity box filters a local index, so "no results" is a completed,
 * successful search — never a pending one and never a failed one. These specs pin
 * down when the empty state may appear.
 */
describe('HomeComponent search empty state', () => {
  let fixture: ComponentFixture<HomeComponent>;
  let component: HomeComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HomeComponent,
        RouterTestingModule,
        TranslateModule.forRoot()
      ],
      providers: [
        provideNoopAnimations(),
        {
          provide: AuthenticationService,
          useValue: {
            getCredentials: () => ({ username: 'mifos' }),
            hasDialogBeenShown: () => true,
            showDialog: jest.fn()
          }
        },
        { provide: MatDialog, useValue: { open: jest.fn() } },
        { provide: ConfigurationWizardService, useValue: { showHome: false, showHomeSearchActivity: false } },
        { provide: PopoverService, useValue: { open: jest.fn() } },
        { provide: SettingsService, useValue: { tenantIdentifier: '' } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  const searchInput = (): HTMLInputElement => fixture.nativeElement.querySelector('input');

  const emptyState = (): Element | null => fixture.nativeElement.querySelector('.empty-state');

  const typeIntoSearch = (value: string): void => {
    const input = searchInput();
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
  };

  it('shows the empty state when a non-empty search matches nothing', () => {
    typeIntoSearch('zzz-no-such-activity');

    const state = emptyState();
    expect(state).toBeTruthy();
    expect(state!.getAttribute('role')).toBe('status');
    expect(state!.textContent).toContain('labels.messages.No matching activities found');
    expect(state!.textContent).toContain('labels.messages.Try a different search term');
  });

  it('keeps rendering matching activities without the empty state', async () => {
    const input = searchInput();
    input.focus();
    input.dispatchEvent(new Event('focusin', { bubbles: true }));
    typeIntoSearch('client');
    await fixture.whenStable();
    fixture.detectChanges();

    expect(emptyState()).toBeNull();
    const options = Array.from(document.querySelectorAll('mat-option')).map((option) => option.textContent!.trim());
    expect(options).toContain('client');
  });

  it('shows no empty state until a search has actually completed', () => {
    // Nothing has been filtered yet: the initial state must not read as "no results".
    expect(emptyState()).toBeNull();

    const emissions: boolean[] = [];
    component.noResults$.subscribe((value) => emissions.push(value));
    expect(emissions).toEqual([false]);

    typeIntoSearch('zzz-no-such-activity');
    expect(emissions).toEqual([
      false,
      true
    ]);
    expect(emptyState()).toBeTruthy();
  });

  it('shows no empty state for an empty or cleared query', () => {
    expect(emptyState()).toBeNull();

    typeIntoSearch('zzz-no-such-activity');
    expect(emptyState()).toBeTruthy();

    typeIntoSearch('');
    expect(emptyState()).toBeNull();
  });

  it('filters the activity index only once per query', () => {
    // The option list and the empty state read the same filtered result, so a
    // query must not be filtered twice. filterActivity labels every activity once.
    const labelSpy = jest.spyOn(component, 'activityLabel');
    labelSpy.mockClear();

    typeIntoSearch('zzz-no-such-activity');

    expect(labelSpy).toHaveBeenCalledTimes(component.allActivities.length);
  });
});
