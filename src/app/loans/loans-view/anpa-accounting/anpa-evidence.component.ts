/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { anpaLabelKey } from './anpa-labels';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTableModule } from '@angular/material/table';
import { Journal, Reason, PolicyDefinition, Charge, Tax } from '../../models/anpa-accounting.model';

@Component({
  selector: 'mifosx-anpa-blockers',
  imports: [
    CommonModule,
    TranslateModule,
    MatExpansionModule
  ],
  template: `<ul class="blockers">
      @for (reason of reasons.slice(0, 3); track reason) {
        <li>{{ 'labels.anpa.blockers.' + reason | translate }}</li>
      }
    </ul>
    @if (reasons.length > 3) {
      <mat-expansion-panel
        ><mat-expansion-panel-header
          ><mat-panel-title
            >{{ 'labels.anpa.blockerDetails' | translate }} ({{ reasons.length }})</mat-panel-title
          ></mat-expansion-panel-header
        >
        <ul class="blockers">
          @for (reason of reasons.slice(3); track reason) {
            <li>{{ 'labels.anpa.blockers.' + reason | translate }}</li>
          }
        </ul></mat-expansion-panel
      >
    }`,
  styles: [
    `
      .blockers {
        padding-inline-start: 24px;
      }
      li {
        margin-block: 8px;
        overflow-wrap: anywhere;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnpaBlockersComponent {
  @Input() reasons: Reason[] = [];
}

@Component({
  selector: 'mifosx-anpa-journals',
  imports: [
    CommonModule,
    TranslateModule,
    MatTableModule
  ],
  template: `@if (journals.length) {
      <div class="table-scroll" tabindex="0" [attr.aria-label]="'labels.anpa.journals' | translate">
        <table mat-table [dataSource]="journals">
          @for (field of fields; track field) {
            <ng-container [matColumnDef]="field"
              ><th mat-header-cell *matHeaderCellDef>{{ labelKey(field) | translate }}</th>
              <td mat-cell *matCellDef="let row">
                @if (field === 'amount') {
                  {{ row.amount === null ? ('labels.inputs.Unavailable' | translate) : (row.amount | number: '1.2-8') }}
                } @else {
                  {{ row[field] === null ? ('labels.inputs.Unavailable' | translate) : row[field] }}
                }
              </td></ng-container
            >
          }
          <tr mat-header-row *matHeaderRowDef="fields"></tr>
          <tr mat-row *matRowDef="let row; columns: fields"></tr>
        </table>
      </div>
    } @else {
      <p>{{ 'labels.anpa.empty' | translate }}</p>
    }`,
  styles: [
    `
      .table-scroll {
        overflow: auto;
        max-width: 100%;
      }
      table {
        min-width: 800px;
      }
      td,
      th {
        padding: 8px 16px;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnpaJournalsComponent {
  readonly labelKey = anpaLabelKey;
  @Input() journals: Journal[] = [];
  readonly fields = [
    'id',
    'loanTransactionId',
    'postingReference',
    'accountId',
    'date',
    'direction',
    'amount',
    'currency',
    'reversed',
    'reversalId'
  ];
}

@Component({
  selector: 'mifosx-anpa-policy-definition',
  imports: [
    CommonModule,
    TranslateModule,
    MatExpansionModule
  ],
  template: `@if (definition) {
    <dl>
      <dt>{{ 'labels.anpa.version' | translate }}</dt>
      <dd>{{ definition.version }}</dd>
      <dt>{{ 'labels.inputs.Accounting Rule' | translate }}</dt>
      <dd>{{ definition.accountingRule }}</dd>
      <dt>{{ 'labels.heading.Currency' | translate }}</dt>
      <dd>{{ definition.currency }}</dd>
      <dt>{{ 'labels.inputs.Effective From' | translate }}</dt>
      <dd>{{ definition.effectiveFrom }}</dd>
      <dt>{{ 'labels.anpa.effectiveThrough' | translate }}</dt>
      <dd>{{ definition.effectiveThrough || ('labels.inputs.Unavailable' | translate) }}</dd>
      <dt>{{ 'labels.anpa.approvalReference' | translate }}</dt>
      <dd>{{ definition.approvalReference }}</dd>
    </dl>
    @for (rule of definition.rules; track $index) {
      <mat-expansion-panel
        ><mat-expansion-panel-header
          ><mat-panel-title>{{
            'labels.anpa.codes.' + rule.category | translate
          }}</mat-panel-title></mat-expansion-panel-header
        >
        <dl>
          @for (field of ruleFields; track field) {
            <dt>{{ labelKey(field) | translate }}</dt>
            <dd>
              @if (field === 'historicalOrigin' || field === 'currentClassification') {
                {{ 'labels.anpa.codes.' + rule[field] | translate }}
              } @else if (field === 'expenseEligible' || field === 'reclassifiedExpenseEligible') {
                {{
                  (rule[field] === null
                    ? 'labels.inputs.Unavailable'
                    : rule[field]
                      ? 'labels.buttons.Yes'
                      : 'labels.buttons.No'
                  ) | translate
                }}
              } @else {
                {{ ruleValue(rule, field) }}
              }
            </dd>
          }
        </dl>
      </mat-expansion-panel>
    }
  }`,
  styles: [
    `
      dl {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 8px;
      }
      dd {
        margin: 0;
        overflow-wrap: anywhere;
      }
      mat-expansion-panel {
        margin-block: 8px;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnpaPolicyDefinitionComponent {
  readonly labelKey = anpaLabelKey;
  @Input() definition: PolicyDefinition | null = null;
  readonly ruleFields = [
    'historicalOrigin',
    'currentClassification',
    'sourceAccountId',
    'nativeMappingId',
    'destinationAccountId',
    'expenseEligible',
    'reclassifiedExpenseEligible',
    'taxComponentId'
  ] as const;
  ruleValue(
    rule: PolicyDefinition['rules'][number],
    field: (typeof this.ruleFields)[number]
  ): string | number | boolean {
    return rule[field] ?? '—';
  }
}

@Component({
  selector: 'mifosx-anpa-charge-evidence',
  imports: [
    CommonModule,
    TranslateModule,
    MatTableModule,
    MatExpansionModule
  ],
  template: `<mat-expansion-panel
    ><mat-expansion-panel-header
      ><mat-panel-title>{{ 'labels.anpa.fees' | translate }} / ITBMS</mat-panel-title></mat-expansion-panel-header
    >
    @if (charges.length) {
      <div class="table-scroll" tabindex="0" [attr.aria-label]="'labels.anpa.fees' | translate">
        <table mat-table [dataSource]="charges">
          @for (field of chargeFields; track field) {
            <ng-container [matColumnDef]="field"
              ><th mat-header-cell *matHeaderCellDef>{{ labelKey(field) | translate }}</th>
              <td mat-cell *matCellDef="let row">
                @if (field === 'penalty') {
                  {{ (row.penalty ? 'labels.buttons.Yes' : 'labels.buttons.No') | translate }}
                } @else {
                  {{ row[field] ?? ('labels.inputs.Unavailable' | translate) }}
                }
              </td></ng-container
            >
          }
          <tr mat-header-row *matHeaderRowDef="chargeFields"></tr>
          <tr mat-row *matRowDef="let row; columns: chargeFields"></tr>
        </table>
      </div>
    } @else {
      <p>{{ 'labels.anpa.empty' | translate }}</p>
    }
    @if (taxes.length) {
      <div class="table-scroll" tabindex="0" [attr.aria-label]="'labels.inputs.Tax Component' | translate">
        <table mat-table [dataSource]="taxes">
          @for (field of taxFields; track field) {
            <ng-container [matColumnDef]="field"
              ><th mat-header-cell *matHeaderCellDef>{{ labelKey(field) | translate }}</th>
              <td mat-cell *matCellDef="let row">
                {{ row[field] ?? ('labels.inputs.Unavailable' | translate) }}
              </td></ng-container
            >
          }
          <tr mat-header-row *matHeaderRowDef="taxFields"></tr>
          <tr mat-row *matRowDef="let row; columns: taxFields"></tr>
        </table>
      </div>
    }
  </mat-expansion-panel>`,
  styles: [
    `
      .table-scroll {
        overflow: auto;
        max-width: 100%;
      }
      table {
        min-width: 800px;
      }
      td,
      th {
        padding: 8px 16px;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnpaChargeEvidenceComponent {
  readonly labelKey = anpaLabelKey;
  @Input() charges: Charge[] = [];
  @Input() taxes: Tax[] = [];
  readonly chargeFields = [
    'id',
    'chargeId',
    'penalty',
    'amount',
    'paid',
    'waivedAmount',
    'writtenOff',
    'outstanding',
    'tax',
    'currency'
  ];
  readonly taxFields = [
    'id',
    'loanChargeId',
    'taxComponentId',
    'amount',
    'debitAccountId',
    'creditAccountId'
  ];
}
