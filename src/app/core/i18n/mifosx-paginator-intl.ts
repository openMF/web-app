/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Injectable, OnDestroy, inject } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { TranslateService } from '@ngx-translate/core';
import { Subscription, merge } from 'rxjs';

/**
 * Custom internationalization provider for Angular Material paginator.
 * Translates labels, pagination controls, and range formatting according
 * to the currently active application locale and refreshes all active
 * paginator instances on runtime language change.
 */
@Injectable()
export class MifosxPaginatorIntl extends MatPaginatorIntl implements OnDestroy {
  private translateService = inject(TranslateService);
  private subscription: Subscription;

  constructor() {
    super();

    this.updateLabels();

    this.subscription = merge(
      this.translateService.onLangChange,
      this.translateService.onTranslationChange,
      this.translateService.onDefaultLangChange
    ).subscribe(() => {
      this.updateLabels();
      this.changes.next();
    });
  }

  /**
   * Updates static paginator labels from the translation service.
   */
  private updateLabels(): void {
    const itemsPerPage = this.translateService.instant('labels.text.Items per page:');
    if (this.isValidTranslation(itemsPerPage, 'labels.text.Items per page:')) {
      this.itemsPerPageLabel = itemsPerPage;
    } else {
      const fallback = this.translateService.instant('labels.text.Items per page');
      if (this.isValidTranslation(fallback, 'labels.text.Items per page')) {
        this.itemsPerPageLabel = fallback;
      }
    }

    const nextPage = this.translateService.instant('labels.buttons.Next page');
    if (this.isValidTranslation(nextPage, 'labels.buttons.Next page')) {
      this.nextPageLabel = nextPage;
    }

    const previousPage = this.translateService.instant('labels.buttons.Previous page');
    if (this.isValidTranslation(previousPage, 'labels.buttons.Previous page')) {
      this.previousPageLabel = previousPage;
    }

    const firstPage = this.translateService.instant('labels.buttons.First page');
    if (this.isValidTranslation(firstPage, 'labels.buttons.First page')) {
      this.firstPageLabel = firstPage;
    }

    const lastPage = this.translateService.instant('labels.buttons.Last page');
    if (this.isValidTranslation(lastPage, 'labels.buttons.Last page')) {
      this.lastPageLabel = lastPage;
    }
  }

  /**
   * Determines whether the translated string is non-empty and not a raw fallback key.
   */
  private isValidTranslation(value: unknown, key: string): boolean {
    return typeof value === 'string' && value.length > 0 && value !== key;
  }

  /**
   * Formats the range label with complete localized sentence structure.
   */
  override getRangeLabel = (page: number, pageSize: number, length: number): string => {
    const ofLabel = this.translateService.instant('labels.text.of');
    const resolvedOf = this.isValidTranslation(ofLabel, 'labels.text.of') ? ofLabel : 'of';

    if (length === 0 || pageSize === 0) {
      return `0 ${resolvedOf} ${length}`;
    }

    length = Math.max(length, 0);
    const startIndex = page * pageSize;
    const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;

    const rangeTemplate = this.translateService.instant('labels.text.{{start}} – {{end}} of {{length}}', {
      start: startIndex + 1,
      end: endIndex,
      length
    });

    if (this.isValidTranslation(rangeTemplate, 'labels.text.{{start}} – {{end}} of {{length}}')) {
      return rangeTemplate;
    }

    return `${startIndex + 1} – ${endIndex} ${resolvedOf} ${length}`;
  };

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
