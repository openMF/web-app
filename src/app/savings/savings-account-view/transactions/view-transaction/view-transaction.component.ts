/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLinkActive, RouterLink, RouterOutlet } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatCard, MatCardHeader, MatCardTitleGroup, MatCardMdImage, MatCardTitle } from '@angular/material/card';
import { MatTooltip } from '@angular/material/tooltip';
import { MatTabNav, MatTabLink, MatTabNavPanel } from '@angular/material/tabs';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { AccountNumberComponent } from 'app/shared/account-number/account-number.component';
import { CurrencyPipe, NgClass } from '@angular/common';
import { Currency } from 'app/shared/models/general.model';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { LongTextComponent } from 'app/shared/long-text/long-text.component';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { StatusLookupPipe } from 'app/pipes/status-lookup.pipe';
import { SavingsButtonsConfiguration } from '../../savings-buttons.config';

interface TransactionDatatable {
  registeredTableName: string;
}

@Component({
  selector: 'mifosx-view-transaction',
  templateUrl: './view-transaction.component.html',
  styleUrls: ['./view-transaction.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    AccountNumberComponent,
    MatCard,
    MatCardHeader,
    MatCardTitleGroup,
    MatCardMdImage,
    MatCardTitle,
    MatTooltip,
    NgClass,
    LongTextComponent,
    MatIconButton,
    MatMenuTrigger,
    MatIcon,
    FaIconComponent,
    MatMenu,
    MatMenuItem,
    MatTabNav,
    MatTabLink,
    RouterLinkActive,
    MatTabNavPanel,
    RouterOutlet,
    CurrencyPipe,
    StatusLookupPipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewTransactionComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  dialog = inject(MatDialog);
  private destroyRef = inject(DestroyRef);

  /** Savings account data resolved from the transaction detail route. */
  savingsAccountData: any;
  /** Button Configurations */
  buttonConfig?: SavingsButtonsConfiguration;
  /** Entity Type */
  entityType = 'Client';
  /** Currency. */
  currency: Currency;

  accountId = '';
  /** Transaction Data Tables */
  entityDatatables: TransactionDatatable[] = [];

  constructor() {
    this.route.data
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data: { savingsAccountData: any; transactionDatatables: TransactionDatatable[] }) => {
        this.savingsAccountData = data.savingsAccountData;
        this.currency = this.savingsAccountData?.currency;
        if (this.savingsAccountData) {
          this.setConditionalButtons();
        }
        this.accountId = this.getRouteParam('savingAccountId') || '';
        this.entityDatatables = data.transactionDatatables;
      });
    if (this.router.url.includes('clients')) {
      this.entityType = 'Client';
    } else if (this.router.url.includes('groups')) {
      this.entityType = 'Group';
    } else if (this.router.url.includes('centers')) {
      this.entityType = 'Center';
    }
  }

  /**
   * Reads a route parameter from this route or any ancestor route.
   */
  private getRouteParam(paramName: string): string | null {
    let route: ActivatedRoute | null = this.route;
    while (route) {
      const paramValue = route.snapshot.paramMap?.get(paramName) || route.snapshot.params?.[paramName];
      if (paramValue) {
        return paramValue;
      }
      route = route.parent;
    }
    return null;
  }

  /**
   * Adds options to button config.
   */
  private setConditionalButtons(): void {
    const status = this.savingsAccountData.status?.value || '';
    const subStatus = this.savingsAccountData.subStatus || {};
    this.buttonConfig = new SavingsButtonsConfiguration(status, subStatus);
  }

  /**
   * Performs action button/option action.
   * @param name action name.
   */
  doAction(name: string): void {
    const transactionsPathIndex = this.router.url.indexOf('/transactions');
    const accountUrl = transactionsPathIndex > -1 ? this.router.url.slice(0, transactionsPathIndex) : this.router.url;
    this.router.navigateByUrl(`${accountUrl}/actions/${name}`);
  }
}
