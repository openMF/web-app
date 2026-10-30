/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { describe, it, expect, beforeEach } from '@jest/globals';

import { KeyboardShortcutsDialogComponent } from './keyboard-shortcuts-dialog.component';
import { KeyboardShortcutsConfiguration } from '../../keyboards-shortcut-config';

async function render(): Promise<ComponentFixture<KeyboardShortcutsDialogComponent>> {
  await TestBed.configureTestingModule({
    imports: [
      KeyboardShortcutsDialogComponent,
      NoopAnimationsModule,
      TranslateModule.forRoot()
    ],
    providers: [
      { provide: MAT_DIALOG_DATA, useValue: {} },
      { provide: MatDialogRef, useValue: { updateSize: (): void => undefined } }
    ]
  }).compileComponents();

  const translateService = TestBed.inject(TranslateService);
  translateService.setTranslation('en-US', {
    labels: { inputs: { Ctrl: 'Ctrl', Shift: 'Shift', Alt: 'Alt' } }
  });
  translateService.use('en-US');

  const fixture = TestBed.createComponent(KeyboardShortcutsDialogComponent);
  fixture.detectChanges();
  return fixture;
}

describe('KeyboardShortcutsDialogComponent', () => {
  beforeEach(() => TestBed.resetTestingModule());

  it('renders one row per configured shortcut', async () => {
    const fixture = await render();
    const rows = fixture.nativeElement.querySelectorAll('.shortcut-row');

    expect(rows).toHaveLength(new KeyboardShortcutsConfiguration().buttonCombinations.length);
  });

  it('keeps every shortcut next to its own description', async () => {
    const fixture = await render();
    const rows = Array.from(fixture.nativeElement.querySelectorAll('.shortcut-row')) as HTMLElement[];

    rows.forEach((row) => {
      const combination = row.querySelector('.shortcut-combination');
      const description = row.querySelector('.shortcut-description');

      expect(combination).not.toBeNull();
      expect(description).not.toBeNull();
      // The description belongs to the shortcut rendered on the very same row.
      expect(row.children).toHaveLength(2);
      expect(row.children[0]).toBe(combination);
      expect(row.children[1]).toBe(description);
    });
  });

  it('pairs each shortcut combination with the description of the same configuration entry', async () => {
    const fixture = await render();
    const rows = Array.from(fixture.nativeElement.querySelectorAll('.shortcut-row')) as HTMLElement[];

    const rendered = rows.map((row) => ({
      combination: row.querySelector('.shortcut-combination').textContent.replace(/\s+/g, ' ').trim(),
      description: row.querySelector('.shortcut-description').textContent.trim()
    }));

    const expected = new KeyboardShortcutsConfiguration().buttonCombinations.map((item) => {
      const parts: string[] = [];
      if (item.ctrlKey) parts.push('Ctrl');
      if (item.shiftKey) parts.push('Shift');
      if (item.altKey) parts.push('Alt');
      parts.push(item.key);
      return { combination: parts.join(' + '), description: item.title };
    });

    expect(rendered).toEqual(expected);
  });

  it('shows the modifier keys of every shortcut as key badges', async () => {
    const fixture = await render();
    const firstRow = fixture.nativeElement.querySelector('.shortcut-row');
    const badges = Array.from(firstRow.querySelectorAll('.modifier-key')).map((badge: Element) =>
      badge.textContent.trim()
    );

    expect(badges).toEqual([
      'Ctrl',
      'Alt',
      'n'
    ]);
  });

  it('separates the rows with a divider', async () => {
    const fixture = await render();
    const dividers = fixture.nativeElement.querySelectorAll('mat-divider');

    expect(dividers).toHaveLength(new KeyboardShortcutsConfiguration().buttonCombinations.length);
  });
});
