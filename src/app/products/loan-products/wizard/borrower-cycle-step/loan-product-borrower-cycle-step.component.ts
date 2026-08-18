/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatIconButton, MatButton } from '@angular/material/button';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable
} from '@angular/material/table';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { TranslateService } from '@ngx-translate/core';

/** Custom Components */
import { FormDialogComponent } from 'app/shared/form-dialog/form-dialog.component';
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';
import { FormfieldBase } from 'app/shared/form-dialog/formfield/model/formfield-base';
import { InputBase } from 'app/shared/form-dialog/formfield/model/input-base';
import { SelectBase } from 'app/shared/form-dialog/formfield/model/select-base';
import { FindPipe } from '../../../../pipes/find.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/** The three payload keys the "Terms vary based on loan cycle" feature writes to. */
export type BorrowerCycleVariationKey =
  | 'principalVariationsForBorrowerCycle'
  | 'numberOfRepaymentVariationsForBorrowerCycle'
  | 'interestRateVariationsForBorrowerCycle';

/** One variation row, matching the object shape `POST /loanproducts` accepts. */
export interface BorrowerCycleVariation {
  valueConditionType: number | string;
  borrowerCycleNumber: number;
  minValue?: number | null;
  defaultValue: number;
  maxValue?: number | null;
}

export type BorrowerCycleVariations = Record<BorrowerCycleVariationKey, BorrowerCycleVariation[]>;

/**
 * Numeric coercion for the dialog's string-valued inputs. Blank / unparseable values become null so
 * the caller can omit the key rather than send an empty string the backend cannot read.
 */
function toFiniteNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

/** Fineract's `LoanProductValueConditionType` ids, which the payload and the backend validator use. */
const EQUAL_CONDITION_ID = 2;
const GREATER_THAN_CONDITION_ID = 3;

/**
 * One rendered section. The three sections are structurally identical — same columns, same dialog
 * fields, same add/edit/delete behaviour — and differ only in heading and target array, so they are
 * declared as data rather than duplicated three times the way the Classic template does.
 */
interface VariationSection {
  key: BorrowerCycleVariationKey;
  heading: string;
  dialogTitle: string;
  /** The `POST /loanproducts` parameter this list maps to; selects Fineract's own error message. */
  backendParam: 'principalCycleNumbers' | 'repaymentCycleNumber' | 'interestRateCycleNumber';
}

/**
 * The "Terms vary based on loan cycle" surface: principal, number of repayments and nominal interest
 * rate, each varying by the borrower's loan cycle number.
 *
 * This is a wizard-side reimplementation of the block the Classic Terms step renders inline
 * (loan-product-terms-step.component.html, the `@if (loanProductTermsForm.value.useBorrowerCycle)`
 * region). Classic's version is not extractable — it is bound directly to `loanProductTermsForm` and
 * interleaved with the rest of that step's controls — so the behaviour is reproduced here against the
 * component's own FormArrays instead. The dialog field definitions, the value-condition option source
 * and the emitted object shape are all kept identical to Classic so both flows submit the same
 * `POST /loanproducts` payload.
 *
 * The wizard holds one flat FormGroup and cannot carry FormArrays of objects, so — exactly like the
 * reused Interest Refund and Deferred Income steps — this component owns the arrays and emits them;
 * the host folds the emitted value into the payload at submit time.
 */
@Component({
  selector: 'mifosx-loan-product-borrower-cycle-step',
  templateUrl: './loan-product-borrower-cycle-step.component.html',
  styleUrls: ['./loan-product-borrower-cycle-step.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent,
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    MatIconButton,
    MatButton,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    FindPipe
  ]
})
export class LoanProductBorrowerCycleStepComponent implements OnInit {
  private readonly formBuilder = inject(UntypedFormBuilder);
  private readonly dialog = inject(MatDialog);
  private readonly translateService = inject(TranslateService);

  /** Backend template, read for `valueConditionTypeOptions` exactly as the Classic step reads it. */
  @Input() loanProductsTemplate: any;

  /** Emitted whenever a variation is added, edited or removed. */
  @Output() setBorrowerCycleVariations = new EventEmitter<BorrowerCycleVariations>();

  /** Same column set and order the Classic tables render. */
  readonly displayedColumns: string[] = [
    'valueConditionType',
    'borrowerCycleNumber',
    'minValue',
    'defaultValue',
    'maxValue',
    'actions'
  ];

  readonly sections: VariationSection[] = [
    {
      key: 'principalVariationsForBorrowerCycle',
      heading: 'labels.inputs.Principal by loan cycle',
      dialogTitle: 'labels.heading.Principal by loan cycle',
      backendParam: 'principalCycleNumbers'
    },
    {
      key: 'numberOfRepaymentVariationsForBorrowerCycle',
      heading: 'labels.inputs.Number of repayments by loan cycle',
      dialogTitle: 'labels.heading.Number of Repayments by loan cycle',
      backendParam: 'repaymentCycleNumber'
    },
    {
      key: 'interestRateVariationsForBorrowerCycle',
      heading: 'labels.inputs.Nominal interest rate by loan cycle',
      dialogTitle: 'labels.inputs.Annual interest rate by loan cycle',
      backendParam: 'interestRateCycleNumber'
    }
  ];

  /** One FormArray per section, keyed exactly like the payload. */
  readonly variations: Record<BorrowerCycleVariationKey, UntypedFormArray> = {
    principalVariationsForBorrowerCycle: this.formBuilder.array([]),
    numberOfRepaymentVariationsForBorrowerCycle: this.formBuilder.array([]),
    interestRateVariationsForBorrowerCycle: this.formBuilder.array([])
  };

  valueConditionTypeData: any[] = [];

  ngOnInit(): void {
    this.valueConditionTypeData = this.loanProductsTemplate?.valueConditionTypeOptions ?? [];
  }

  /** Rows for a section's table. `MatTable` needs a plain array, like the Classic template passes. */
  rowsFor(key: BorrowerCycleVariationKey): BorrowerCycleVariation[] {
    return this.variations[key].value as BorrowerCycleVariation[];
  }

  /**
   * Translation key for the section's rule violation, or null when the list is valid (an empty list
   * is always valid — Fineract only validates a populated one).
   *
   * Fineract's `LoanProductDataValidator` rejects a populated variation list unless it starts with an
   * `equals` row, ends with a `greater than` row, and carries cycle numbers that advance: consecutive
   * `equals` rows must run 1, 2, 3…, and a `greater than` row must exceed the row before it. Reading
   * a list as "cycle 1 gets X, cycle 2 gets Y, cycle 3 and beyond get Z" makes the shape obvious —
   * the trailing `greater than` is the open-ended catch-all, so a one-row list can never be valid.
   *
   * Reproducing the rules here turns three round-trips of cryptic 400s into inline guidance. The
   * messages are Fineract's own, already translated in every locale.
   */
  sectionErrorKey(section: VariationSection): string | null {
    const rows = this.rowsFor(section.key);
    if (rows.length === 0) {
      return null;
    }
    const prefix = `errors.validation.msg.loanproduct.${section.backendParam}`;
    // Flag only a condition we positively identified as the WRONG one. An unrecognised condition is
    // left to the backend rather than blocking a product that may well be valid.
    if (this.conditionKind(rows[0]) === 'greaterThan') {
      return `${prefix}.condition.type.must.start.with.equal`;
    }
    if (this.conditionKind(rows[rows.length - 1]) === 'equal') {
      // Includes the single-row case: one row is both first and last, and cannot be both conditions.
      return `${prefix}.condition.type.must.end.with.greterthan`;
    }
    // Cycle numbering, confirmed against the backend's own `args` (found value, expected value):
    // an `equals` row must be the next cycle (previous + 1), while a `greater than` row REPEATS the
    // cycle number above it — its number is a threshold, not the next cycle. So "equals 1 = 20000,
    // greater than 1 = 35000" reads "cycle 1 gets 20000; cycles above 1 get 35000".
    let previousCycle = 0;
    for (const row of rows) {
      const cycle = Number(row.borrowerCycleNumber);
      if (!Number.isFinite(cycle)) {
        continue;
      }
      const kind = this.conditionKind(row);
      if (kind === 'equal' && cycle !== previousCycle + 1) {
        return 'labels.text.Rows with the equals condition must be numbered consecutively from 1';
      }
      if (kind === 'greaterThan' && cycle !== previousCycle) {
        return 'labels.text.A row with the greater than condition must repeat the cycle number above it';
      }
      previousCycle = cycle;
    }
    return null;
  }

  /** True when every section satisfies Fineract's rules; read by the host before it submits. */
  get isValid(): boolean {
    return this.sections.every((section) => this.sectionErrorKey(section) === null);
  }

  /**
   * Classifies a row's condition, resolving Fineract's `LoanProductValueConditionType`.
   *
   * Id first, deliberately: the ids ARE the API contract — they are what the select binds, what the
   * payload carries and what the backend validator reads — so they are the stable signal. The option
   * `code` is only a fallback for a backend using non-standard ids, and it is matched leniently
   * (lower-cased, and accepting Fineract's own misspelling "greterthan" alongside "greaterthan").
   *
   * Anything unrecognised returns 'unknown', which callers must treat as "cannot judge" rather than
   * "invalid" — a guard that blocks a valid product is far worse than one that defers to the backend.
   */
  private conditionKind(row: BorrowerCycleVariation): 'equal' | 'greaterThan' | 'unknown' {
    const id = Number(row.valueConditionType);
    if (id === EQUAL_CONDITION_ID) {
      return 'equal';
    }
    if (id === GREATER_THAN_CONDITION_ID) {
      return 'greaterThan';
    }
    const code = (this.conditionCodeFor(row) ?? '').toLowerCase();
    if (code.endsWith('equal')) {
      return 'equal';
    }
    if (code.includes('greterthan') || code.includes('greaterthan')) {
      return 'greaterThan';
    }
    return 'unknown';
  }

  private conditionCodeFor(row: BorrowerCycleVariation): string | undefined {
    return this.valueConditionTypeData.find((option) => option.id === row.valueConditionType)?.code;
  }

  add(section: VariationSection): void {
    const dialogRef = this.dialog.open(FormDialogComponent, { data: this.dialogData(section) });
    dialogRef.afterClosed().subscribe((response: any) => {
      if (response?.data) {
        this.variations[section.key].push(response.data);
        this.emit();
      }
    });
  }

  edit(section: VariationSection, index: number): void {
    const data = {
      ...this.dialogData(section, this.variations[section.key].at(index).value),
      layout: { addButtonText: 'Edit' }
    };
    const dialogRef = this.dialog.open(FormDialogComponent, { data });
    dialogRef.afterClosed().subscribe((response: any) => {
      if (response?.data) {
        this.variations[section.key].at(index).patchValue(response.data.value);
        this.emit();
      }
    });
  }

  delete(section: VariationSection, index: number): void {
    // `DeleteDialogComponent` interpolates `deleteContext` straight into "Are you sure you want to
    // delete … ?", so it must be translated. Classic passes a hardcoded `this`; use the existing
    // Variations label instead, which every locale already carries.
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: this.translateService.instant('labels.inputs.Variations') }
    });
    dialogRef.afterClosed().subscribe((response: any) => {
      if (response?.delete) {
        this.variations[section.key].removeAt(index);
        this.emit();
      }
    });
  }

  private emit(): void {
    this.setBorrowerCycleVariations.emit({
      principalVariationsForBorrowerCycle: this.payloadRowsFor('principalVariationsForBorrowerCycle'),
      numberOfRepaymentVariationsForBorrowerCycle: this.payloadRowsFor('numberOfRepaymentVariationsForBorrowerCycle'),
      interestRateVariationsForBorrowerCycle: this.payloadRowsFor('interestRateVariationsForBorrowerCycle')
    });
  }

  /**
   * The rows as `POST /loanproducts` needs them: real numbers, with blank optional bounds omitted.
   *
   * The dialog's inputs hand back strings ("1", "20000") and empty strings for untouched optional
   * fields. That matters here in a way it does not for the flat form: Fineract parses each variation
   * element with `extractIntegerNamed(..., jsonObject, locale)`, taking `locale` from the element
   * itself rather than the request root. Our nested objects carry no `locale`, so a string value
   * cannot be parsed and arrives as null — the cycle-number check then fails with "must be same as 1"
   * even though the operator entered 1. Sending numbers sidesteps the locale lookup entirely.
   *
   * A blank `minValue`/`maxValue` is omitted rather than sent as "", which Fineract cannot read as a
   * decimal either, and which means "no bound" anyway.
   */
  private payloadRowsFor(key: BorrowerCycleVariationKey): BorrowerCycleVariation[] {
    return (this.variations[key].value as BorrowerCycleVariation[])
      .filter((row) => !!row && typeof row === 'object')
      .map((row) => {
        const variation: BorrowerCycleVariation = {
          valueConditionType: toFiniteNumber(row.valueConditionType) ?? row.valueConditionType,
          borrowerCycleNumber: toFiniteNumber(row.borrowerCycleNumber) as number,
          defaultValue: toFiniteNumber(row.defaultValue) as number
        };
        const minValue = toFiniteNumber(row.minValue);
        if (minValue !== null) {
          variation.minValue = minValue;
        }
        const maxValue = toFiniteNumber(row.maxValue);
        if (maxValue !== null) {
          variation.maxValue = maxValue;
        }
        return variation;
      });
  }

  private dialogData(section: VariationSection, values?: BorrowerCycleVariation) {
    return {
      title: this.translateService.instant(section.dialogTitle),
      formfields: this.formfields(values)
    };
  }

  /**
   * The dialog's fields, field-for-field identical to Classic's `getFormfields` — same control names,
   * same order, same `required`/`min` rules — so a variation created here is indistinguishable from
   * one created in the Classic Terms step.
   */
  private formfields(values?: BorrowerCycleVariation): FormfieldBase[] {
    return [
      new SelectBase({
        controlName: 'valueConditionType',
        label: this.translateService.instant('labels.inputs.Condition'),
        value: values ? values.valueConditionType : this.valueConditionTypeData[0]?.id,
        options: { label: 'value', value: 'id', data: this.valueConditionTypeData },
        required: true,
        order: 1
      }),
      new InputBase({
        controlName: 'borrowerCycleNumber',
        label: this.translateService.instant('labels.inputs.Loan Cycle'),
        value: values ? values.borrowerCycleNumber : undefined,
        type: 'number',
        required: true,
        min: 0,
        order: 2
      }),
      new InputBase({
        controlName: 'minValue',
        label: this.translateService.instant('labels.inputs.Minimum'),
        value: values ? values.minValue : undefined,
        type: 'number',
        min: 0,
        order: 3
      }),
      new InputBase({
        controlName: 'defaultValue',
        label: this.translateService.instant('labels.inputs.Default'),
        value: values ? values.defaultValue : undefined,
        type: 'number',
        required: true,
        min: 0,
        order: 4
      }),
      new InputBase({
        controlName: 'maxValue',
        label: this.translateService.instant('labels.inputs.Maximum'),
        value: values ? values.maxValue : undefined,
        type: 'number',
        min: 0,
        order: 5
      })
    ];
  }
}
