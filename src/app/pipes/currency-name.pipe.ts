/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Pipe, PipeTransform, inject, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SettingsService } from 'app/settings/settings.service';
import { Subscription } from 'rxjs';

@Pipe({ name: 'currencyName', pure: false })
export class CurrencyNamePipe implements PipeTransform, OnDestroy {
  private translateService = inject(TranslateService);
  private settingsService = inject(SettingsService);
  private cdr = inject(ChangeDetectorRef);
  private onLangChange: Subscription;

  constructor() {
    this.onLangChange = this.translateService.onLangChange.subscribe(() => {
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    if (this.onLangChange) {
      this.onLangChange.unsubscribe();
    }
  }

  transform(currency: { code?: string; name?: string; nameCode?: string } | string | null | undefined): string {
    if (!currency) {
      return '';
    }

    const code = typeof currency === 'string' ? currency : currency.code;
    const fallbackName = typeof currency === 'string' ? currency : currency.name || currency.code || '';

    if (!code) {
      return fallbackName;
    }

    const currentLang = this.translateService.currentLang || this.settingsService.language?.code || 'en-US';

    try {
      const displayNames = new Intl.DisplayNames([currentLang], { type: 'currency' });
      const localized = displayNames.of(code);
      if (localized && localized !== code) {
        return localized.charAt(0).toUpperCase() + localized.slice(1);
      }
    } catch {
      // Return fallback if Intl.DisplayNames fails
    }

    return fallbackName;
  }
}
