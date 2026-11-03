/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { readFileSync } from 'fs';
import { join } from 'path';
import { MifosxPaginatorIntl } from './mifosx-paginator-intl';

const locales = [
  'az-AZ',
  'cs-CS',
  'de-DE',
  'en-US',
  'es-CL',
  'es-MX',
  'fr-FR',
  'it-IT',
  'ko-KO',
  'lt-LT',
  'lv-LV',
  'ne-NE',
  'pt-PT',
  'sw-SW'
];

function loadTranslation(locale: string) {
  return JSON.parse(readFileSync(join(process.cwd(), 'src/assets/translations', `${locale}.json`), 'utf8'));
}

describe('MifosxPaginatorIntl', () => {
  let paginatorIntl: MifosxPaginatorIntl;
  let translateService: TranslateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        {
          provide: MatPaginatorIntl,
          useClass: MifosxPaginatorIntl
        }
      ]
    });

    translateService = TestBed.inject(TranslateService);

    // Seed English and French translations from repository asset files
    translateService.setTranslation('en-US', loadTranslation('en-US'));
    translateService.setTranslation('fr-FR', loadTranslation('fr-FR'));
    translateService.setTranslation('de-DE', loadTranslation('de-DE'));

    translateService.setDefaultLang('en-US');
    translateService.use('en-US');

    paginatorIntl = TestBed.inject(MatPaginatorIntl) as MifosxPaginatorIntl;
  });

  afterEach(() => {
    paginatorIntl.ngOnDestroy();
  });

  describe('Application Integration', () => {
    it('resolves MifosxPaginatorIntl from the MatPaginatorIntl token', () => {
      expect(paginatorIntl).toBeInstanceOf(MifosxPaginatorIntl);
      expect(paginatorIntl).toBeInstanceOf(MatPaginatorIntl);
    });
  });

  describe('English Translations', () => {
    it('provides localized labels in English', () => {
      expect(paginatorIntl.itemsPerPageLabel).toBe('Items per page:');
      expect(paginatorIntl.nextPageLabel).toBe('Next page');
      expect(paginatorIntl.previousPageLabel).toBe('Previous page');
      expect(paginatorIntl.firstPageLabel).toBe('First page');
      expect(paginatorIntl.lastPageLabel).toBe('Last page');
    });

    it('formats range labels in English', () => {
      // First page (1-10 of 240)
      expect(paginatorIntl.getRangeLabel(0, 10, 240)).toBe('1 – 10 of 240');

      // Second page (11-20 of 240)
      expect(paginatorIntl.getRangeLabel(1, 10, 240)).toBe('11 – 20 of 240');

      // Final partially populated page (231-240 of 235 -> 231-235 of 235)
      expect(paginatorIntl.getRangeLabel(23, 10, 235)).toBe('231 – 235 of 235');

      // Empty table
      expect(paginatorIntl.getRangeLabel(0, 10, 0)).toBe('0 of 0');

      // Zero page size
      expect(paginatorIntl.getRangeLabel(0, 0, 100)).toBe('0 of 100');
    });
  });

  describe('French Translations', () => {
    beforeEach(() => {
      translateService.use('fr-FR');
    });

    it('provides localized labels in French', () => {
      expect(paginatorIntl.itemsPerPageLabel).toBe('Éléments par page :');
      expect(paginatorIntl.nextPageLabel).toBe('Page suivante');
      expect(paginatorIntl.previousPageLabel).toBe('Page précédente');
      expect(paginatorIntl.firstPageLabel).toBe('Première page');
      expect(paginatorIntl.lastPageLabel).toBe('Dernière page');
    });

    it('formats range labels in French', () => {
      // First page
      expect(paginatorIntl.getRangeLabel(0, 10, 240)).toBe('1 – 10 sur 240');

      // Second page
      expect(paginatorIntl.getRangeLabel(1, 10, 240)).toBe('11 – 20 sur 240');

      // Final partially populated page
      expect(paginatorIntl.getRangeLabel(23, 10, 235)).toBe('231 – 235 sur 235');

      // Empty table
      expect(paginatorIntl.getRangeLabel(0, 10, 0)).toBe('0 sur 0');

      // Zero page size
      expect(paginatorIntl.getRangeLabel(0, 0, 100)).toBe('0 sur 100');
    });
  });

  describe('Runtime Language Switching', () => {
    it('updates labels, range formatting, and emits changes notification on language switch', () => {
      const changesSpy = jest.fn();
      const sub = paginatorIntl.changes.subscribe(changesSpy);

      // Initially in English
      expect(paginatorIntl.itemsPerPageLabel).toBe('Items per page:');
      expect(paginatorIntl.getRangeLabel(0, 10, 50)).toBe('1 – 10 of 50');

      // Switch to French
      translateService.use('fr-FR');

      expect(changesSpy).toHaveBeenCalledTimes(1);
      expect(paginatorIntl.itemsPerPageLabel).toBe('Éléments par page :');
      expect(paginatorIntl.nextPageLabel).toBe('Page suivante');
      expect(paginatorIntl.previousPageLabel).toBe('Page précédente');
      expect(paginatorIntl.firstPageLabel).toBe('Première page');
      expect(paginatorIntl.lastPageLabel).toBe('Dernière page');
      expect(paginatorIntl.getRangeLabel(0, 10, 50)).toBe('1 – 10 sur 50');

      // Switch to German
      translateService.use('de-DE');

      expect(changesSpy).toHaveBeenCalledTimes(2);
      expect(paginatorIntl.itemsPerPageLabel).toBe('Elemente pro Seite:');
      expect(paginatorIntl.nextPageLabel).toBe('Nächste Seite');
      expect(paginatorIntl.previousPageLabel).toBe('Vorherige Seite');
      expect(paginatorIntl.firstPageLabel).toBe('Erste Seite');
      expect(paginatorIntl.lastPageLabel).toBe('Letzte Seite');
      expect(paginatorIntl.getRangeLabel(0, 10, 50)).toBe('1 – 10 von 50');

      // Switch back to English
      translateService.use('en-US');

      expect(changesSpy).toHaveBeenCalledTimes(3);
      expect(paginatorIntl.itemsPerPageLabel).toBe('Items per page:');
      expect(paginatorIntl.getRangeLabel(0, 10, 50)).toBe('1 – 10 of 50');

      sub.unsubscribe();
    });
  });

  describe('Translation Locale Files Completeness', () => {
    it.each(locales)('contains all required paginator keys in %s.json', (locale) => {
      const translation = loadTranslation(locale);
      const paginator = translation?.labels?.text?.paginator;

      expect(paginator).toBeDefined();
      expect(typeof paginator.itemsPerPage).toBe('string');
      expect(paginator.itemsPerPage.length).toBeGreaterThan(0);

      expect(typeof paginator.nextPage).toBe('string');
      expect(paginator.nextPage.length).toBeGreaterThan(0);

      expect(typeof paginator.previousPage).toBe('string');
      expect(paginator.previousPage.length).toBeGreaterThan(0);

      expect(typeof paginator.firstPage).toBe('string');
      expect(paginator.firstPage.length).toBeGreaterThan(0);

      expect(typeof paginator.lastPage).toBe('string');
      expect(paginator.lastPage.length).toBeGreaterThan(0);

      expect(typeof paginator.rangeLabel).toBe('string');
      expect(paginator.rangeLabel).toContain('{{start}}');
      expect(paginator.rangeLabel).toContain('{{end}}');
      expect(paginator.rangeLabel).toContain('{{length}}');

      expect(typeof paginator.emptyRangeLabel).toBe('string');
      expect(paginator.emptyRangeLabel).toContain('{{length}}');
    });
  });
});
