/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { DocumentLanguageService } from './document-language.service';

describe('DocumentLanguageService', () => {
  let service: DocumentLanguageService;
  let mockDocument: { documentElement: { lang: string } };
  let mockTranslateService: {
    currentLang: string | null;
    onLangChange: Subject<LangChangeEvent>;
  };

  beforeEach(() => {
    mockDocument = {
      documentElement: {
        lang: 'en'
      }
    };

    mockTranslateService = {
      currentLang: null,
      onLangChange: new Subject<LangChangeEvent>()
    };

    TestBed.configureTestingModule({
      providers: [
        DocumentLanguageService,
        { provide: DOCUMENT, useValue: mockDocument },
        { provide: TranslateService, useValue: mockTranslateService }
      ]
    });
  });

  afterEach(() => {
    if (service) {
      service.ngOnDestroy();
    }
  });

  it('should initialize and preserve default lang if currentLang is not yet set', () => {
    service = TestBed.inject(DocumentLanguageService);
    expect(mockDocument.documentElement.lang).toBe('en');
  });

  it('should synchronize an active non-English locale during initialization', () => {
    mockTranslateService.currentLang = 'de-DE';
    service = TestBed.inject(DocumentLanguageService);

    expect(mockDocument.documentElement.lang).toBe('de-DE');
  });

  it('should update root language to fr-FR when onLangChange emits fr-FR', () => {
    service = TestBed.inject(DocumentLanguageService);
    expect(mockDocument.documentElement.lang).toBe('en');

    mockTranslateService.onLangChange.next({
      lang: 'fr-FR',
      translations: {}
    });

    expect(mockDocument.documentElement.lang).toBe('fr-FR');
  });

  it('should preserve regional locales such as es-CL and es-MX exactly without truncation', () => {
    service = TestBed.inject(DocumentLanguageService);

    mockTranslateService.onLangChange.next({
      lang: 'es-CL',
      translations: {}
    });
    expect(mockDocument.documentElement.lang).toBe('es-CL');

    mockTranslateService.onLangChange.next({
      lang: 'es-MX',
      translations: {}
    });
    expect(mockDocument.documentElement.lang).toBe('es-MX');
  });

  it('should update the document repeatedly across sequential locale switches', () => {
    service = TestBed.inject(DocumentLanguageService);

    const locales = [
      'de-DE',
      'fr-FR',
      'pt-PT',
      'sw-SW',
      'en-US'
    ];
    for (const locale of locales) {
      mockTranslateService.onLangChange.next({
        lang: locale,
        translations: {}
      });
      expect(mockDocument.documentElement.lang).toBe(locale);
    }
  });

  it('should support the initial saved-language restoration path', () => {
    service = TestBed.inject(DocumentLanguageService);
    expect(mockDocument.documentElement.lang).toBe('en');

    // Simulate async restoration of saved language preference from storage
    mockTranslateService.currentLang = 'fr-FR';
    service.setDocumentLanguage(mockTranslateService.currentLang);
    expect(mockDocument.documentElement.lang).toBe('fr-FR');

    // Translation loader completes and emits onLangChange
    mockTranslateService.onLangChange.next({
      lang: 'fr-FR',
      translations: { APP_NAME: 'MifosX' }
    });
    expect(mockDocument.documentElement.lang).toBe('fr-FR');
  });

  it('should clean up subscriptions on ngOnDestroy to prevent leaked listeners', () => {
    service = TestBed.inject(DocumentLanguageService);

    mockTranslateService.onLangChange.next({
      lang: 'de-DE',
      translations: {}
    });
    expect(mockDocument.documentElement.lang).toBe('de-DE');

    service.ngOnDestroy();

    // Subsequent emissions after destroy should not mutate the document
    mockTranslateService.onLangChange.next({
      lang: 'fr-FR',
      translations: {}
    });
    expect(mockDocument.documentElement.lang).toBe('de-DE');
  });

  it('should be idempotent when init() is called multiple times', () => {
    service = TestBed.inject(DocumentLanguageService);
    service.init();
    service.init();

    mockTranslateService.onLangChange.next({
      lang: 'it-IT',
      translations: {}
    });
    expect(mockDocument.documentElement.lang).toBe('it-IT');
  });

  it('should handle undefined or null document or documentElement safely', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        DocumentLanguageService,
        { provide: DOCUMENT, useValue: {} },
        { provide: TranslateService, useValue: mockTranslateService }
      ]
    });
    const headlessService = TestBed.inject(DocumentLanguageService);

    expect(() => {
      headlessService.setDocumentLanguage('de-DE');
      mockTranslateService.onLangChange.next({ lang: 'de-DE', translations: {} });
    }).not.toThrow();

    headlessService.ngOnDestroy();
  });
});
