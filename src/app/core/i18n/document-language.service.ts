/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Injectable, OnDestroy, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

/**
 * Service responsible for synchronizing document.documentElement.lang
 * with the active application language.
 */
@Injectable({
  providedIn: 'root'
})
export class DocumentLanguageService implements OnDestroy {
  private document = inject(DOCUMENT);
  private translateService = inject(TranslateService);
  private langChangeSubscription?: Subscription;

  constructor() {
    this.init();
  }

  /**
   * Initializes the document language synchronization.
   * Immediately synchronizes the current active language if present,
   * and listens for runtime language changes.
   */
  public init(): void {
    if (this.langChangeSubscription) {
      return;
    }

    if (this.translateService?.currentLang) {
      this.setDocumentLanguage(this.translateService.currentLang);
    }

    if (this.translateService?.onLangChange) {
      this.langChangeSubscription = this.translateService.onLangChange.subscribe((event: LangChangeEvent) => {
        if (event && event.lang) {
          this.setDocumentLanguage(event.lang);
        }
      });
    }
  }

  /**
   * Sets the lang attribute of the document root element.
   * Preserves full locale identifiers (e.g. 'en-US', 'fr-FR', 'es-MX', 'es-CL').
   *
   * @param language Locale identifier
   */
  public setDocumentLanguage(language: string): void {
    if (language && this.document?.documentElement) {
      this.document.documentElement.lang = language;
    }
  }

  ngOnDestroy(): void {
    if (this.langChangeSubscription) {
      this.langChangeSubscription.unsubscribe();
      this.langChangeSubscription = undefined;
    }
  }
}
