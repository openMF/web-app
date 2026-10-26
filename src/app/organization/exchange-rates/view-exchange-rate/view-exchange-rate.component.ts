/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { take } from 'rxjs';

import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

import { ExchangeRate } from '../exchange-rate.model';
import { resolveSourceCurrencyCode, resolveTargetCurrencyCode } from '../exchange-rate-form.util';
import { ExchangeRatesService } from '../exchange-rates.service';

@Component({
  selector: 'mifosx-view-exchange-rate',
  templateUrl: './view-exchange-rate.component.html',
  styleUrls: ['./view-exchange-rate.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent,
    RouterLink
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewExchangeRateComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private exchangeRatesService = inject(ExchangeRatesService);
  private destroyRef = inject(DestroyRef);

  exchangeRateData: ExchangeRate;

  constructor() {
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { exchangeRate: ExchangeRate }) => {
      this.exchangeRateData = data.exchangeRate;
    });
  }

  deleteExchangeRate() {
    const deleteExchangeRateDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `exchange rate ${this.exchangeRateData.id}` }
    });
    deleteExchangeRateDialogRef.afterClosed().subscribe((response?: { delete?: boolean }) => {
      if (response?.delete) {
        this.exchangeRatesService
          .deleteExchangeRate(this.exchangeRateData.id)
          .pipe(take(1))
          .subscribe(() => this.router.navigate(['../../'], { relativeTo: this.route }));
      }
    });
  }

  get sourceCurrencyCode(): string {
    return resolveSourceCurrencyCode(this.exchangeRateData);
  }

  get targetCurrencyCode(): string {
    return resolveTargetCurrencyCode(this.exchangeRateData);
  }
}
