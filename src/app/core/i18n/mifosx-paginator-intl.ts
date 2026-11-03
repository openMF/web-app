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
    const itemsPerPage = this.translateService.instant('labels.text.paginator.itemsPerPage');
    if (this.isValidTranslation(itemsPerPage, 'labels.text.paginator.itemsPerPage')) {
      this.itemsPerPageLabel = itemsPerPage;
    }

    const nextPage = this.translateService.instant('labels.text.paginator.nextPage');
    if (this.isValidTranslation(nextPage, 'labels.text.paginator.nextPage')) {
      this.nextPageLabel = nextPage;
    } else {
      const fallback = this.translateService.instant('labels.buttons.Next page');
      if (this.isValidTranslation(fallback, 'labels.buttons.Next page')) {
        this.nextPageLabel = fallback;
      }
    }

    const previousPage = this.translateService.instant('labels.text.paginator.previousPage');
    if (this.isValidTranslation(previousPage, 'labels.text.paginator.previousPage')) {
      this.previousPageLabel = previousPage;
    } else {
      const fallback = this.translateService.instant('labels.buttons.Previous page');
      if (this.isValidTranslation(fallback, 'labels.buttons.Previous page')) {
        this.previousPageLabel = fallback;
      }
    }

    const firstPage = this.translateService.instant('labels.text.paginator.firstPage');
    if (this.isValidTranslation(firstPage, 'labels.text.paginator.firstPage')) {
      this.firstPageLabel = firstPage;
    } else {
      const fallback = this.translateService.instant('labels.buttons.First page');
      if (this.isValidTranslation(fallback, 'labels.buttons.First page')) {
        this.firstPageLabel = fallback;
      }
    }

    const lastPage = this.translateService.instant('labels.text.paginator.lastPage');
    if (this.isValidTranslation(lastPage, 'labels.text.paginator.lastPage')) {
      this.lastPageLabel = lastPage;
    } else {
      const fallback = this.translateService.instant('labels.buttons.Last page');
      if (this.isValidTranslation(fallback, 'labels.buttons.Last page')) {
        this.lastPageLabel = fallback;
      }
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
    if (length === 0 || pageSize === 0) {
      const emptyRange = this.translateService.instant('labels.text.paginator.emptyRangeLabel', { length });
      if (this.isValidTranslation(emptyRange, 'labels.text.paginator.emptyRangeLabel')) {
        return emptyRange;
      }
      const ofLabel = this.translateService.instant('labels.text.of');
      const resolvedOf = this.isValidTranslation(ofLabel, 'labels.text.of') ? ofLabel : 'of';
      return `0 ${resolvedOf} ${length}`;
    }

    length = Math.max(length, 0);
    const startIndex = page * pageSize;
    const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;

    const range = this.translateService.instant('labels.text.paginator.rangeLabel', {
      start: startIndex + 1,
      end: endIndex,
      length
    });

    if (this.isValidTranslation(range, 'labels.text.paginator.rangeLabel')) {
      return range;
    }

    return `${startIndex + 1} – ${endIndex} of ${length}`;
  };

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
