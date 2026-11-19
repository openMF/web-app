/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { InvestmentAccessService } from './investment-access.service';
@Component({
  selector: 'mifosx-investment-product-details',
  standalone: true,
  imports: [
    RouterModule,
    SharedModule
  ],
  styleUrls: ['./investment-products.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="investment-nav" [attr.aria-label]="'Investment.navigation' | translate">
      <a mat-button routerLink="/products/investment-products">{{ 'Investment.title' | translate }}</a>
      @if (access.has('READ_INVESTMENT_PRODUCT_POLICY')) {
        <a mat-button [routerLink]="['/products/investment-products', id]">{{ 'Investment.overview' | translate }}</a>
        @if (access.has('UPDATE_INVESTMENT_PRODUCT_POLICY')) {
          <a mat-button [routerLink]="['/products/investment-products', id, 'edit']">{{
            'Investment.configure' | translate
          }}</a>
        }
      }
      @if (access.has('READ_INVESTMENT_RATE')) {
        <a mat-button [routerLink]="['/products/investment-products', id, 'rates']">{{
          'Investment.matrix' | translate
        }}</a>
      }
      <a mat-button [routerLink]="['/products/investment-products', id, 'history']">{{
        'Investment.history' | translate
      }}</a>
    </nav>
    <router-outlet />
  `
})
export class InvestmentProductDetailsComponent {
  access = inject(InvestmentAccessService);
  id = inject(ActivatedRoute).snapshot.paramMap.get('productId');
}
