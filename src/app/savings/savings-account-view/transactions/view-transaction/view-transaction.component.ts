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
import { ActivatedRoute, RouterLinkActive, RouterLink, RouterOutlet } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { MatCard, MatCardMdImage } from '@angular/material/card';
import { MatTooltip } from '@angular/material/tooltip';
import { MatTabNav, MatTabLink, MatTabNavPanel } from '@angular/material/tabs';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { ClientsService } from 'app/clients/clients.service';
import { AccountHeaderComponent } from 'app/shared/account-header/account-header.component';
import { AccountNumberComponent } from 'app/shared/account-number/account-number.component';
import { EntityNameComponent } from 'app/shared/entity-name/entity-name.component';
import { ExternalIdentifierComponent } from 'app/shared/external-identifier/external-identifier.component';

@Component({
  selector: 'mifosx-view-transaction',
  templateUrl: './view-transaction.component.html',
  styleUrls: ['./view-transaction.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    AccountHeaderComponent,
    AccountNumberComponent,
    EntityNameComponent,
    ExternalIdentifierComponent,
    MatCard,
    MatCardMdImage,
    MatTooltip,
    MatTabNav,
    MatTabLink,
    RouterLinkActive,
    MatTabNavPanel,
    RouterOutlet
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewTransactionComponent {
  private route = inject(ActivatedRoute);
  private clientsService = inject(ClientsService);
  private sanitizer = inject(DomSanitizer);
  dialog = inject(MatDialog);
  private destroyRef = inject(DestroyRef);

  /** Client data inherited from the client route. */
  clientViewData: any;
  /** Client profile image. */
  clientImage: any;
  /** Transaction data. */
  transactionData: any;

  accountId: any;
  /** Transaction Data Tables */
  entityDatatables: any;

  /**
   * @param {Router} router Router for navigation.
   * @param {MatDialog} dialog Dialog reference.
   */
  constructor() {
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { transactionDatatables: any }) => {
      this.accountId = this.route.snapshot.params['savingAccountId'];
      this.entityDatatables = data.transactionDatatables;
    });
    this.setClientDataFromRoute();
  }

  /**
   * Finds resolved client data from the ancestor client route.
   */
  private setClientDataFromRoute(): void {
    let route = this.route.parent;
    while (route && !this.clientViewData) {
      const clientViewData = route.snapshot.data['clientViewData'];
      if (clientViewData) {
        this.clientViewData = clientViewData;
        this.loadClientImage();
      }
      route = route.parent;
    }
  }

  /**
   * Loads the client profile image when available.
   */
  private loadClientImage(): void {
    if (!this.clientViewData?.id) {
      return;
    }
    this.clientsService
      .getClientProfileImage(this.clientViewData.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (base64Image: any) => {
          this.clientImage = base64Image ? this.sanitizer.bypassSecurityTrustResourceUrl(base64Image) : null;
        },
        error: () => {
          this.clientImage = null;
        }
      });
  }
}
