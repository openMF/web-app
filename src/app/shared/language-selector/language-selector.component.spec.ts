/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { Observable, Subject } from 'rxjs';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

import { SettingsService } from 'app/settings/settings.service';

import { LanguageSelectorComponent } from './language-selector.component';

/** Holds every translation file back until the test releases it, like a slow network. */
class DeferredLoader implements TranslateLoader {
  readonly pending = new Map<string, Subject<object>>();

  getTranslation(lang: string): Observable<object> {
    const file = new Subject<object>();
    this.pending.set(lang, file);
    return file;
  }

  release(lang: string, translations: object): void {
    const file = this.pending.get(lang);
    file.next(translations);
    file.complete();
  }
}

const ENGLISH = { languages: { 'en-US': 'English', 'fr-FR': 'French' } };
const FRENCH = { languages: { 'en-US': 'Anglais', 'fr-FR': 'Français' } };

describe('LanguageSelectorComponent', () => {
  let loader: DeferredLoader;
  let translateService: TranslateService;

  beforeEach(async () => {
    TestBed.resetTestingModule();
    loader = new DeferredLoader();
    await TestBed.configureTestingModule({
      imports: [
        LanguageSelectorComponent,
        NoopAnimationsModule,
        TranslateModule.forRoot({ loader: { provide: TranslateLoader, useValue: loader } })
      ],
      providers: [{ provide: SettingsService, useValue: { setLanguage: jest.fn() } }]
    }).compileComponents();

    translateService = TestBed.inject(TranslateService);
    translateService.addLangs([
      'en-US',
      'fr-FR'
    ]);
  });

  function displayedLanguage(fixture: ComponentFixture<LanguageSelectorComponent>): string {
    const valueText = fixture.nativeElement.querySelector('.mat-mdc-select-value-text');
    return valueText ? valueText.textContent.trim() : '';
  }

  it('shows the current language once its translations finish loading after the page opens', async () => {
    // On a fresh page load the language is chosen before its translation file has arrived.
    translateService.use('en-US');
    const fixture = TestBed.createComponent(LanguageSelectorComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    loader.release('en-US', ENGLISH);
    fixture.detectChanges();

    expect(displayedLanguage(fixture)).toBe('English');
  });

  it('shows the newly picked language in that language', () => {
    translateService.use('en-US');
    loader.release('en-US', ENGLISH);
    const fixture = TestBed.createComponent(LanguageSelectorComponent);
    fixture.detectChanges();

    fixture.componentInstance.languageSelector.setValue('fr-FR');
    fixture.componentInstance.setLanguage();
    loader.release('fr-FR', FRENCH);
    fixture.detectChanges();

    expect(displayedLanguage(fixture)).toBe('Français');
  });
});
