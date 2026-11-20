/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin, switchMap } from 'rxjs';
import { AdToBsPipe } from 'app/pipes/ad-to-bs.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { ComplianceService } from '../compliance.service';
import {
  AmlSettings,
  AmlSettingsView,
  CashClass,
  GoamlCodeLists,
  GoamlLookup,
  PaymentTypeClass
} from '../compliance.models';

/** The settings a cooperative may change, with how each is edited. */
const AMOUNTS: (keyof AmlSettings)[] = [
  'riskLine',
  'unusualYearlyLine',
  'eddMonitoringLine',
  'sourceOfFundsLine',
  'ttrLine'
];
const WHOLE_NUMBERS: (keyof AmlSettings)[] = [
  'ttrDays',
  'strTargetDays',
  'reviewYearsHigh',
  'reviewYearsMedium',
  'reviewYearsNormal',
  'changeNoticeDays',
  'retentionYears',
  'pepRetentionYears',
  'structuringWindowDays',
  'structuringBandPercent',
  'screeningPossibleScore',
  'screeningLikelyScore'
];
const CHOICES: (keyof AmlSettings)[] = [
  'atLineCountsAs',
  'lineMeasured',
  'yearBasis',
  'fullKymBelowLineGrade'
];
const SWITCHES: (keyof AmlSettings)[] = [
  'sourceOfFundsDayTotal',
  'kymGateEnabled',
  'remittanceService',
  'sharesCountAsCash',
  'unknownPaymentCountsAsCash',
  'relationshipsFromList'
];
const TEXTS: (keyof AmlSettings)[] = [
  'goamlEntityId',
  'goamlBranchCode',
  'unListUrl',
  'kymGateAllFrom',
  'secondApproverAbove'
];

/** `institution` (NAME, CODE) has no schema list - free text instead of a select (docs/goaml-reports.md). */
const GOAML_INSTITUTION_TYPE = 'institution';

/** A lookup type narrow enough to share a row with the one right before it, keyed by that type. */
const GOAML_ROW_PARTNER: Record<string, string> = {
  contact_type: 'communication_type',
  currency: 'country'
};

/**
 * Configurations › Compliance (fineract-dbug #196, #198): every amount and period of the model AML/CFT policy,
 * with the policy's own value beside each, and how each payment type moves money. Read-only without
 * UPDATE_AMLSETTINGS. Only what changed is sent; the backend keeps the change in the audit trail.
 */
@Component({
  selector: 'mifosx-compliance-settings',
  templateUrl: './compliance-settings.component.html',
  styleUrls: ['./compliance-settings.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatProgressBar,
    MatTableModule,
    AdToBsPipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ComplianceSettingsComponent implements OnInit {
  private compliance = inject(ComplianceService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private translate = inject(TranslateService);
  private destroyRef = inject(DestroyRef);

  readonly view = signal<AmlSettingsView | null>(null);
  readonly saving = signal(false);
  readonly canEdit = signal(false);
  readonly paymentColumns = [
    'name',
    'cashClass'
  ];
  readonly cashClasses: CashClass[] = [
    'CASH',
    'COOP_BANK_CASH',
    'NON_CASH'
  ];

  form: FormGroup = this.fb.group({});
  /** Payment type id to its class, as edited. */
  classes: Record<number, CashClass | ''> = {};

  // ---- FIU-Nepal's codes (fineract-dbug #288; docs/goaml-reports.md, "Codes")

  readonly goamlLookups = signal<GoamlLookup[]>([]);
  readonly goamlCodeLists = signal<GoamlCodeLists>({});
  readonly savingCodes = signal(false);
  /** `type::ourValue` to the code being edited, so two types never share one row by chance. */
  goamlCodes: Record<string, string> = {};

  readonly goamlGroups = computed(() => {
    const groups = new Map<string, GoamlLookup[]>();
    for (const row of this.goamlLookups()) {
      const rows = groups.get(row.type) ?? [];
      rows.push(row);
      groups.set(row.type, rows);
    }
    return Array.from(groups.entries()).map(
      ([
        type,
        rows
      ]) => ({ type, rows })
    );
  });

  /** `goamlGroups()`, two to a row where `GOAML_ROW_PARTNER` says so; one to a row otherwise. */
  readonly goamlGroupRows = computed(() => {
    const rows: { type: string; rows: GoamlLookup[] }[][] = [];
    for (const group of this.goamlGroups()) {
      const partner = GOAML_ROW_PARTNER[group.type];
      const last = rows[rows.length - 1];
      if (partner && last?.length === 1 && last[0].type === partner) {
        last.push(group);
      } else {
        rows.push([group]);
      }
    }
    return rows;
  });

  ngOnInit(): void {
    this.compliance
      .loadAccess()
      .pipe(
        switchMap((access) => {
          this.canEdit.set(access.permissions.includes('UPDATE_AMLSETTINGS'));
          return forkJoin([
            this.compliance.settings(),
            this.compliance.goamlLookups(),
            this.compliance.goamlCodeLists()
          ]);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(
        ([
          v,
          lookups,
          codeLists
        ]) => {
          this.show(v);
          this.showGoamlCodes(lookups);
          this.goamlCodeLists.set(codeLists);
        }
      );
  }

  private showGoamlCodes(rows: GoamlLookup[]): void {
    this.goamlLookups.set(rows);
    this.goamlCodes = {};
    rows.forEach((r) => (this.goamlCodes[this.goamlRowKey(r)] = r.code ?? ''));
  }

  goamlRowKey(row: Pick<GoamlLookup, 'type' | 'ourValue'>): string {
    return `${row.type}::${row.ourValue}`;
  }

  isInstitutionType(type: string): boolean {
    return type === GOAML_INSTITUTION_TYPE;
  }

  goamlCodeOptions(type: string): string[] {
    return this.goamlCodeLists()[type] ?? [];
  }

  goamlCodeValue(row: GoamlLookup): string {
    return this.goamlCodes[this.goamlRowKey(row)] ?? '';
  }

  setGoamlCode(row: GoamlLookup, value: string): void {
    this.goamlCodes[this.goamlRowKey(row)] = value;
  }

  isGoamlCodeEmpty(row: GoamlLookup): boolean {
    return !this.goamlCodeValue(row).trim();
  }

  /** Whether this row shows a hint sentence long enough to wrap onto two or three lines (the institution code's
   * hint always does; any empty row's "stays a draft" hint does too) - these need extra room below them so the
   * wrapped lines don't reach the field after them; a one-line hint (most rows) does not. */
  hasLongHint(row: GoamlLookup, type: string): boolean {
    return (this.isInstitutionType(type) && row.ourValue === 'CODE') || this.isGoamlCodeEmpty(row);
  }

  /** Re-read on every change-detection pass (not a signal computed()), since `goamlCodes` is a plain edited map,
   * the same way `isGoamlCodeEmpty` already is - so the count in the header stays live as codes are picked. */
  goamlMissingCount(): number {
    return this.goamlLookups().filter((r) => this.isGoamlCodeEmpty(r)).length;
  }

  saveGoamlCodes(): void {
    if (!this.canEdit() || this.savingCodes()) {
      return;
    }
    const rows: GoamlLookup[] = this.goamlLookups().map((r) => ({
      type: r.type,
      ourValue: r.ourValue,
      description: r.description,
      code: this.goamlCodeValue(r).trim() || null
    }));
    this.savingCodes.set(true);
    this.compliance.updateGoamlLookups(rows).subscribe({
      next: (fresh) => {
        this.savingCodes.set(false);
        this.showGoamlCodes(fresh);
        this.snackBar.open(this.translate.instant('compliance.goaml.Codes saved'), undefined, { duration: 3000 });
      },
      error: () => this.savingCodes.set(false)
    });
  }

  private show(v: AmlSettingsView): void {
    const s = v.settings;
    const controls: Record<string, any> = {};
    AMOUNTS.forEach(
      (k) => (controls[k] = [
          s[k],
          [
            Validators.required,
            Validators.min(1)
          ]
        ])
    );
    WHOLE_NUMBERS.forEach(
      (k) => (controls[k] = [
          s[k],
          [
            Validators.required,
            Validators.min(1)
          ]
        ])
    );
    CHOICES.forEach(
      (k) => (controls[k] = [
          s[k],
          Validators.required
        ])
    );
    SWITCHES.forEach((k) => (controls[k] = [!!s[k]]));
    TEXTS.forEach((k) => (controls[k] = [s[k] ?? '']));
    this.form = this.fb.group(controls);
    if (!this.canEdit()) {
      this.form.disable();
    }
    this.classes = {};
    v.paymentTypes.forEach((t) => (this.classes[t.id] = t.cashClass ?? ''));
    this.view.set(v);
  }

  /** The policy's own value for a setting, shown beside it. */
  policy(key: keyof AmlSettings): unknown {
    return this.view()?.policyDefaults[key];
  }

  setClass(type: PaymentTypeClass, value: CashClass): void {
    this.classes[type.id] = value;
  }

  save(): void {
    const v = this.view();
    if (!v || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const changes: Record<string, unknown> = {};
    const raw = this.form.getRawValue();
    Object.keys(raw).forEach((k) => {
      const before = (v.settings as any)[k] ?? '';
      const after = raw[k] ?? '';
      if (String(before) !== String(after)) {
        changes[k] = after === '' ? null : after;
      }
    });
    const paymentClasses = v.paymentTypes
      .filter((t) => this.classes[t.id] && this.classes[t.id] !== (t.cashClass ?? ''))
      .map((t) => ({ paymentTypeId: t.id, cashClass: this.classes[t.id] as CashClass }));
    if (paymentClasses.length) {
      changes['paymentClasses'] = paymentClasses;
    }
    if (!Object.keys(changes).length) {
      this.snackBar.open(this.translate.instant('compliance.Nothing changed'), undefined, { duration: 3000 });
      return;
    }
    this.saving.set(true);
    this.compliance
      .updateSettings(changes as any)
      .pipe(
        switchMap(() => this.compliance.settings()),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (fresh) => {
          this.saving.set(false);
          this.show(fresh);
          this.snackBar.open(this.translate.instant('compliance.Settings saved'), undefined, { duration: 3000 });
        },
        error: () => this.saving.set(false)
      });
  }

  cancel(): void {
    const v = this.view();
    if (v) {
      this.show(v);
    }
  }
}
