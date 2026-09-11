/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { activities } from './activities';
import { HomeComponent } from './home.component';
import { AuthenticationService } from '../core/authentication/authentication.service';
import { PopoverService } from '../configuration-wizard/popover/popover.service';
import { ConfigurationWizardService } from '../configuration-wizard/configuration-wizard.service';
import { SettingsService } from 'app/settings/settings.service';

describe('Home search index', () => {
  it('labels every entry', () => {
    const unlabelled = activities.filter((entry) => !entry.activity?.trim());
    expect(unlabelled).toEqual([]);
  });

  it('points every entry at an absolute path', () => {
    const relative = activities.filter((entry) => !entry.path?.startsWith('/'));
    expect(relative).toEqual([]);
  });

  it('leaves no route parameter unresolved', () => {
    const parameterised = activities.filter((entry) => entry.path.includes(':'));
    expect(parameterised).toEqual([]);
  });

  it('lists every label once', () => {
    const labels = activities.map((entry) => entry.activity);
    expect(labels).toEqual([...new Set(labels)]);
  });

  it('covers the top level modules', () => {
    const paths = activities.map((entry) => entry.path);
    expect(paths).toEqual(
      expect.arrayContaining([
        '/loans',
        '/collections/collection-sheet',
        '/notifications',
        '/profile',
        '/settings',
        '/checker-inbox-and-tasks'
      ])
    );
  });
});

describe('HomeComponent search', () => {
  let component: HomeComponent;

  const search = (text: string | null): string[] => {
    let results: any[] = [];
    component.filteredActivities.subscribe((activities: any[]) => (results = activities));
    component.searchText.setValue(text);
    return results.map((entry) => entry.activity);
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthenticationService, useValue: {} },
        { provide: ActivatedRoute, useValue: {} },
        { provide: Router, useValue: {} },
        { provide: MatDialog, useValue: {} },
        { provide: ConfigurationWizardService, useValue: {} },
        { provide: PopoverService, useValue: {} },
        { provide: SettingsService, useValue: {} }
      ]
    });
    component = TestBed.runInInjectionContext(() => new HomeComponent());
    component.setFilteredActivities();
  });

  it('matches a module by name', () => {
    expect(search('loans')).toContain('loans');
    expect(search('notifications')).toContain('notifications');
  });

  it('matches a word from the middle of a label', () => {
    expect(search('tasks')).toContain('checker inbox and tasks');
    expect(search('loan product')).toContain('create loan product');
  });

  it('is case insensitive', () => {
    expect(search('Profile')).toContain('profile');
  });

  it('lists everything when the box is emptied', () => {
    expect(search('')).toHaveLength(activities.length);
  });

  it('survives the control being reset', () => {
    expect(search(null)).toHaveLength(activities.length);
  });
});
