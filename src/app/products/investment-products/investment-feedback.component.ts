/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, Input, Pipe, PipeTransform, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Capabilities } from './investment-product.models';

/** Reuse shared vocabulary for dynamic backend field and enum labels. */
const sharedLabels: Record<string, string> = {
  'fields.currencyCode': 'labels.inputs.Currency',
  'mapping.mappingId': 'labels.inputs.Mapping id',
  'mapping.disabled': 'labels.inputs.Disabled',
  'mapping.classification': 'labels.inputs.Classification',
  'mapping.paymentType': 'labels.inputs.Payment Type Id',
  'codes.MONTHLY': 'labels.inputs.Monthly',
  'codes.NONE': 'labels.accounting.NONE',
  'codes.ACCOUNTING_1': 'labels.accounting.NONE',
  'fields.investmentType': 'Investment.type',
  'fields.maximumReinvestmentsByTerm': 'Investment.termLimits',
  'capabilities.rateLookupSupported': 'Investment.lookup',
  'capabilities.ratePublicationSupported': 'Investment.publication'
};

@Pipe({ name: 'investmentCode', standalone: true, pure: false })
export class InvestmentCodePipe implements PipeTransform {
  private translate = inject(TranslateService);
  transform(code: string | number | boolean | null | undefined, group = 'codes'): string {
    if (typeof code === 'boolean') return this.translate.instant(code ? 'labels.commons.Yes' : 'labels.commons.No');
    if (typeof code === 'number') return String(code);
    if (!code) return this.translate.instant('Investment.unknown');
    const [
      base,
      ...detail
    ] = code.split(':');
    const key = sharedLabels[group + '.' + base] ?? 'Investment.' + group + '.' + base;
    const translated = this.translate.instant(key);
    return (translated === key ? base : translated) + (detail.length ? ': ' + detail.join(':') : '');
  }
}
@Component({
  selector: 'mifosx-investment-feedback',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    MatProgressSpinnerModule,
    InvestmentCodePipe
  ],
  template: `
    @if (loading) {
      <div role="status" class="investment-loading">
        <mat-spinner diameter="32" />{{ 'Investment.loading' | translate }}
      </div>
    }
    @if (error) {
      <p role="alert">{{ error | translate }}</p>
    }
    @if (message) {
      <p role="status">{{ message | translate }}</p>
    }
    @if (details.length) {
      <ul role="alert">
        @for (detail of details; track $index) {
          <li>{{ detail.field }}: {{ detail.message }}</li>
        }
      </ul>
    }
    @if (blockers.length) {
      <section aria-live="polite">
        <h3>{{ 'Investment.blockers' | translate }}</h3>
        <ul>
          @for (blocker of blockers; track $index) {
            <li>{{ blocker | investmentCode }}</li>
          }
        </ul>
      </section>
    }
    @if (capabilities) {
      <h3>{{ 'Investment.capabilitiesTitle' | translate }}</h3>
      <dl class="investment-metadata">
        @for (item of capabilities | keyvalue; track item.key) {
          <div>
            <dt>{{ item.key | investmentCode: 'capabilities' }}</dt>
            <dd>
              {{
                (item.key === 'independentReviewRequired'
                  ? item.value
                    ? 'labels.commons.Yes'
                    : 'labels.commons.No'
                  : item.value
                    ? 'Investment.supported'
                    : 'Investment.unsupported'
                ) | translate
              }}
            </dd>
          </div>
        }
      </dl>
    }
  `,
  styleUrls: ['./investment-products.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvestmentFeedbackComponent {
  @Input() loading = false;
  @Input() error = '';
  @Input() message = '';
  @Input() blockers: string[] = [];
  @Input() details: { field: string; message: string }[] = [];
  @Input() capabilities: Capabilities | null = null;
}
