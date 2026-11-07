/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { EMPTY, catchError, finalize, switchMap, takeWhile, timer } from 'rxjs';

import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { DatetimeFormatPipe } from 'app/pipes/datetime-format.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { environment } from 'environments/environment';
import { BaseTellerService, CatalogCategory, CatalogUpdateResponse, CatalogUpdateStatus } from '../base-teller.service';

const CATALOG_STATUS_POLL_INTERVAL = 5000;

@Component({
  selector: 'mifosx-catalog-updates',
  templateUrl: './catalog-updates.component.html',
  styleUrls: ['./catalog-updates.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    DatetimeFormatPipe,
    MatIcon,
    MatProgressSpinner
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CatalogUpdatesComponent implements OnInit {
  private readonly baseTellerService = inject(BaseTellerService);
  private readonly authenticationService = inject(AuthenticationService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translateService = inject(TranslateService);
  private readonly pollingCategories = new Set<CatalogCategory>();

  catalogUpdates: CatalogUpdateResponse[] = [];
  updatingCategories = new Set<CatalogCategory>();
  categoryErrors = new Map<CatalogCategory, string>();
  loadError = '';
  isLoading = false;
  readonly canUpdate = this.hasPermission('UPDATE_BASE_TELLER_CATALOG_UPDATE');

  ngOnInit(): void {
    this.loadCatalogUpdates();
  }

  loadCatalogUpdates(): void {
    if (this.isLoading) {
      return;
    }
    this.isLoading = true;
    this.loadError = '';
    this.baseTellerService
      .getCatalogUpdates()
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.changeDetectorRef.markForCheck();
        })
      )
      .subscribe({
        next: (catalogUpdates) => {
          this.catalogUpdates = catalogUpdates;
          this.pollUpdatingCategories(catalogUpdates);
        },
        error: () => {
          this.loadError = 'catalogUpdates.errors.load';
        }
      });
  }

  synchronize(catalogUpdate: CatalogUpdateResponse): void {
    const category = catalogUpdate.category;
    if (!this.canUpdate || this.updatingCategories.has(category)) {
      return;
    }

    this.updatingCategories.add(category);
    this.categoryErrors.delete(category);
    this.changeDetectorRef.markForCheck();
    this.baseTellerService
      .synchronizeCatalog(category)
      .pipe(
        finalize(() => {
          this.updatingCategories.delete(category);
          this.changeDetectorRef.markForCheck();
        })
      )
      .subscribe({
        next: (result) => {
          this.replaceCatalogUpdate(result);
          this.pollUpdatingCategories([result]);
          if (result.status === 'CURRENT') {
            this.snackBar.open(this.translateService.instant('catalogUpdates.messages.success'), undefined, {
              duration: 4000
            });
          } else if (result.status === 'FAILED') {
            this.categoryErrors.set(category, this.failureMessageKey(result.failureCode));
          }
        },
        error: () => {
          this.categoryErrors.set(category, 'catalogUpdates.errors.update');
        }
      });
  }

  categoryKey(category: CatalogCategory): string {
    return `catalogUpdates.categories.${category}`;
  }

  statusKey(status: CatalogUpdateStatus): string {
    return `catalogUpdates.status.${status}`;
  }

  actionKey(catalogUpdate: CatalogUpdateResponse): string {
    if (this.isUpdating(catalogUpdate)) {
      return 'catalogUpdates.actions.updating';
    }
    return catalogUpdate.status === 'FAILED' ? 'catalogUpdates.actions.retry' : 'catalogUpdates.actions.update';
  }

  isUpdating(catalogUpdate: CatalogUpdateResponse): boolean {
    return catalogUpdate.status === 'UPDATING' || this.updatingCategories.has(catalogUpdate.category);
  }

  errorKey(catalogUpdate: CatalogUpdateResponse): string {
    return (
      this.categoryErrors.get(catalogUpdate.category) ||
      (catalogUpdate.status === 'FAILED' ? this.failureMessageKey(catalogUpdate.failureCode) : '')
    );
  }

  private replaceCatalogUpdate(result: CatalogUpdateResponse): void {
    this.catalogUpdates = this.catalogUpdates.map((item) => (item.category === result.category ? result : item));
  }

  private pollUpdatingCategories(catalogUpdates: CatalogUpdateResponse[]): void {
    catalogUpdates
      .filter(({ status }) => status === 'UPDATING')
      .forEach(({ category }) => this.pollCategoryUntilComplete(category));
  }

  private pollCategoryUntilComplete(category: CatalogCategory): void {
    if (this.pollingCategories.has(category)) {
      return;
    }
    this.pollingCategories.add(category);
    timer(CATALOG_STATUS_POLL_INTERVAL, CATALOG_STATUS_POLL_INTERVAL)
      .pipe(
        switchMap(() => this.baseTellerService.getCatalogUpdate(category).pipe(catchError(() => EMPTY))),
        takeWhile(({ status }) => status === 'UPDATING', true),
        finalize(() => this.pollingCategories.delete(category)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((result) => {
        this.replaceCatalogUpdate(result);
        this.changeDetectorRef.markForCheck();
      });
  }

  private failureMessageKey(failureCode: string | null): string {
    switch (failureCode) {
      case 'SOURCE_VALIDATION_FAILED':
        return 'catalogUpdates.errors.sourceValidation';
      case 'REFRESH_ALREADY_RUNNING':
        return 'catalogUpdates.errors.alreadyRunning';
      case 'INTERRUPTED_REFRESH':
        return 'catalogUpdates.errors.interrupted';
      default:
        return 'catalogUpdates.errors.unknown';
    }
  }

  private hasPermission(permission: string): boolean {
    if (!environment.productionModeEnableRBAC) {
      return true;
    }
    const permissions = this.authenticationService.getCredentials()?.permissions ?? [];
    return permissions.includes('ALL_FUNCTIONS') || permissions.includes(permission);
  }
}
