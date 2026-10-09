/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

import {
  BorrowerCycleVariation,
  BorrowerCycleVariations,
  LoanProductBorrowerCycleStepComponent
} from './loan-product-borrower-cycle-step.component';

describe('LoanProductBorrowerCycleStepComponent', () => {
  const valueConditionTypeOptions = [
    { id: 2, code: 'loanProduct.valueConditionType.equal', value: 'equals' },
    { id: 3, code: 'loanProduct.valueConditionType.greterthan', value: 'greater than' }
  ];

  /** Last `dialog.open` call's config, so tests can assert what the dialog was asked to render. */
  let lastDialogData: any;
  /** What the next `afterClosed()` should emit — the shape FormDialogComponent returns. */
  let dialogResponse: any;

  const dialogStub = {
    open: jest.fn((_component: unknown, config?: any) => {
      lastDialogData = config?.data;
      return { afterClosed: () => of(dialogResponse) };
    })
  };

  function createComponent(): LoanProductBorrowerCycleStepComponent {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        LoanProductBorrowerCycleStepComponent,
        { provide: UntypedFormBuilder, useClass: UntypedFormBuilder },
        { provide: MatDialog, useValue: dialogStub },
        { provide: TranslateService, useValue: { instant: (key: string) => key } }
      ]
    });
    const component = TestBed.inject(LoanProductBorrowerCycleStepComponent);
    component.loanProductsTemplate = { valueConditionTypeOptions };
    component.ngOnInit();
    return component;
  }

  /** A FormGroup shaped like the one FormDialogComponent hands back in `response.data`. */
  function variationGroup(variation: BorrowerCycleVariation): UntypedFormGroup {
    return new UntypedFormGroup({
      valueConditionType: new UntypedFormControl(variation.valueConditionType),
      borrowerCycleNumber: new UntypedFormControl(variation.borrowerCycleNumber),
      minValue: new UntypedFormControl(variation.minValue ?? null),
      defaultValue: new UntypedFormControl(variation.defaultValue),
      maxValue: new UntypedFormControl(variation.maxValue ?? null)
    });
  }

  const firstCycle: BorrowerCycleVariation = {
    valueConditionType: 2,
    borrowerCycleNumber: 1,
    minValue: 10000,
    defaultValue: 20000,
    maxValue: 30000
  };

  beforeEach(() => {
    dialogStub.open.mockClear();
    lastDialogData = undefined;
    dialogResponse = undefined;
  });

  it('renders the three sections the sheet lists (rows 26, 27 and 29)', () => {
    const component = createComponent();

    expect(component.sections.map((section) => section.key)).toEqual([
      'principalVariationsForBorrowerCycle',
      'numberOfRepaymentVariationsForBorrowerCycle',
      'interestRateVariationsForBorrowerCycle'
    ]);
  });

  it('starts with every section empty', () => {
    const component = createComponent();

    component.sections.forEach((section) => {
      expect([
        section.key,
        component.rowsFor(section.key)
      ]).toEqual([
        section.key,
        []
      ]);
    });
  });

  it('offers the Classic dialog fields, in Classic order', () => {
    // Field-for-field parity keeps a variation created here indistinguishable from one created in the
    // Classic Terms step, so both flows submit the same payload.
    const component = createComponent();
    dialogResponse = { data: undefined };

    component.add(component.sections[0]);

    expect(lastDialogData.formfields.map((field: any) => field.controlName)).toEqual([
      'valueConditionType',
      'borrowerCycleNumber',
      'minValue',
      'defaultValue',
      'maxValue'
    ]);
    // Classic defaults the condition select to the template's first option.
    expect(lastDialogData.formfields[0].value).toBe(2);
    expect(lastDialogData.formfields[0].required).toBe(true);
    expect(lastDialogData.formfields[3].required).toBe(true);
    // The optional bounds carry no value until the operator supplies one.
    expect(lastDialogData.formfields[2].required).toBeFalsy();
    expect(lastDialogData.formfields[4].required).toBeFalsy();
  });

  it('adds a row to the targeted section only, and emits', () => {
    const component = createComponent();
    let emitted: BorrowerCycleVariations | undefined;
    component.setBorrowerCycleVariations.subscribe((value) => (emitted = value));
    dialogResponse = { data: variationGroup(firstCycle) };

    component.add(component.sections[0]);

    expect(component.rowsFor('principalVariationsForBorrowerCycle')).toEqual([firstCycle]);
    expect(component.rowsFor('numberOfRepaymentVariationsForBorrowerCycle')).toEqual([]);
    expect(component.rowsFor('interestRateVariationsForBorrowerCycle')).toEqual([]);
    expect(emitted?.principalVariationsForBorrowerCycle).toEqual([firstCycle]);
  });

  it('does not add anything when the dialog is dismissed', () => {
    const component = createComponent();
    const emit = jest.fn();
    component.setBorrowerCycleVariations.subscribe(emit);
    dialogResponse = { data: undefined };

    component.add(component.sections[0]);

    expect(component.rowsFor('principalVariationsForBorrowerCycle')).toEqual([]);
    expect(emit).not.toHaveBeenCalled();
  });

  it('seeds the edit dialog from the existing row and applies the change', () => {
    const component = createComponent();
    dialogResponse = { data: variationGroup(firstCycle) };
    component.add(component.sections[0]);

    const edited = { ...firstCycle, defaultValue: 25000 };
    dialogResponse = { data: variationGroup(edited) };
    component.edit(component.sections[0], 0);

    // Classic seeds each field from the row being edited and relabels the confirm button.
    expect(lastDialogData.formfields[3].value).toBe(20000);
    expect(lastDialogData.layout).toEqual({ addButtonText: 'Edit' });
    expect(component.rowsFor('principalVariationsForBorrowerCycle')).toEqual([edited]);
  });

  it('removes a row only after the delete dialog is confirmed', () => {
    const component = createComponent();
    dialogResponse = { data: variationGroup(firstCycle) };
    component.add(component.sections[0]);

    dialogResponse = { delete: false };
    component.delete(component.sections[0], 0);
    expect(component.rowsFor('principalVariationsForBorrowerCycle')).toEqual([firstCycle]);

    dialogResponse = { delete: true };
    component.delete(component.sections[0], 0);
    expect(component.rowsFor('principalVariationsForBorrowerCycle')).toEqual([]);
  });

  it('passes a translated delete context, not a hardcoded word', () => {
    // DeleteDialogComponent interpolates this straight into "Are you sure you want to delete … ?",
    // so an untranslated literal would leak English into every locale.
    const component = createComponent();
    dialogResponse = { data: variationGroup(firstCycle) };
    component.add(component.sections[0]);

    dialogResponse = { delete: false };
    component.delete(component.sections[0], 0);

    expect(lastDialogData.deleteContext).toBe('labels.inputs.Variations');
  });

  it('emits all three arrays together so the host can fold them into one payload', () => {
    const component = createComponent();
    let emitted: BorrowerCycleVariations | undefined;
    component.setBorrowerCycleVariations.subscribe((value) => (emitted = value));

    dialogResponse = { data: variationGroup(firstCycle) };
    component.add(component.sections[0]);
    dialogResponse = { data: variationGroup({ valueConditionType: 2, borrowerCycleNumber: 1, defaultValue: 12 }) };
    component.add(component.sections[1]);

    expect(Object.keys(emitted!)).toEqual([
      'principalVariationsForBorrowerCycle',
      'numberOfRepaymentVariationsForBorrowerCycle',
      'interestRateVariationsForBorrowerCycle'
    ]);
    expect(emitted!.principalVariationsForBorrowerCycle.length).toBe(1);
    expect(emitted!.numberOfRepaymentVariationsForBorrowerCycle.length).toBe(1);
    expect(emitted!.interestRateVariationsForBorrowerCycle).toEqual([]);
  });

  describe('payload shape', () => {
    /** What the dialog actually hands back: every input value is a string, blanks are ''. */
    function stringyGroup(v: Record<string, unknown>): UntypedFormGroup {
      return new UntypedFormGroup({
        valueConditionType: new UntypedFormControl(v['valueConditionType']),
        borrowerCycleNumber: new UntypedFormControl(v['borrowerCycleNumber']),
        minValue: new UntypedFormControl(v['minValue'] ?? ''),
        defaultValue: new UntypedFormControl(v['defaultValue']),
        maxValue: new UntypedFormControl(v['maxValue'] ?? '')
      });
    }

    it('emits numbers, not the strings the dialog produces', () => {
      // Fineract parses each variation element using a `locale` read from that element, which our
      // nested objects do not carry — so a string "1" arrives as null and the cycle-number check
      // fails with "must be same as 1". Numbers sidestep the locale lookup entirely.
      const component = createComponent();
      let emitted: BorrowerCycleVariations | undefined;
      component.setBorrowerCycleVariations.subscribe((value) => (emitted = value));

      dialogResponse = {
        data: stringyGroup({ valueConditionType: 2, borrowerCycleNumber: '1', defaultValue: '20000' })
      };
      component.add(component.sections[0]);

      expect(emitted!.principalVariationsForBorrowerCycle[0]).toEqual({
        valueConditionType: 2,
        borrowerCycleNumber: 1,
        defaultValue: 20000
      });
    });

    it('omits blank optional bounds instead of sending empty strings', () => {
      const component = createComponent();
      let emitted: BorrowerCycleVariations | undefined;
      component.setBorrowerCycleVariations.subscribe((value) => (emitted = value));

      dialogResponse = {
        data: stringyGroup({ valueConditionType: 2, borrowerCycleNumber: '1', defaultValue: '20000' })
      };
      component.add(component.sections[0]);

      const row = emitted!.principalVariationsForBorrowerCycle[0];
      expect('minValue' in row).toBe(false);
      expect('maxValue' in row).toBe(false);
    });

    it('keeps the optional bounds the operator did fill in, as numbers', () => {
      const component = createComponent();
      let emitted: BorrowerCycleVariations | undefined;
      component.setBorrowerCycleVariations.subscribe((value) => (emitted = value));

      dialogResponse = {
        data: stringyGroup({
          valueConditionType: 2,
          borrowerCycleNumber: '1',
          minValue: '10000',
          defaultValue: '20000',
          maxValue: '30000'
        })
      };
      component.add(component.sections[0]);

      expect(emitted!.principalVariationsForBorrowerCycle[0]).toEqual({
        valueConditionType: 2,
        borrowerCycleNumber: 1,
        minValue: 10000,
        defaultValue: 20000,
        maxValue: 30000
      });
    });

    it('emits the whole configuration from the screenshot as numbers', () => {
      const component = createComponent();
      let emitted: BorrowerCycleVariations | undefined;
      component.setBorrowerCycleVariations.subscribe((value) => (emitted = value));

      [
        { valueConditionType: 2, borrowerCycleNumber: '1', defaultValue: '20000' },
        { valueConditionType: 3, borrowerCycleNumber: '2', defaultValue: '35000' }
      ].forEach((variation) => {
        dialogResponse = { data: stringyGroup(variation) };
        component.add(component.sections[0]);
      });

      expect(emitted!.principalVariationsForBorrowerCycle).toEqual([
        { valueConditionType: 2, borrowerCycleNumber: 1, defaultValue: 20000 },
        { valueConditionType: 3, borrowerCycleNumber: 2, defaultValue: 35000 }
      ]);
    });
  });

  describe('Fineract variation rules', () => {
    // `LoanProductDataValidator` rejects a populated list unless it starts with `equals`, ends with
    // `greater than`, and carries cycle numbers that advance. Reproducing the rules turns three
    // round-trips of cryptic 400s into inline guidance.
    const EQUALS = 2;
    const GREATER_THAN = 3;

    function seed(component: LoanProductBorrowerCycleStepComponent, rows: BorrowerCycleVariation[]): void {
      rows.forEach((row) => {
        dialogResponse = { data: variationGroup(row) };
        component.add(component.sections[0]);
      });
    }

    it('accepts an empty list — the backend only validates a populated one', () => {
      const component = createComponent();

      expect(component.sectionErrorKey(component.sections[0])).toBeNull();
      expect(component.isValid).toBe(true);
    });

    it('accepts the canonical shape: equals 1, then greater than 1', () => {
      // The greater-than row's number is a THRESHOLD, not the next cycle: "cycle 1 gets 20000,
      // cycles above 1 get 35000". Confirmed from the backend's args (found 2, expected 1).
      const component = createComponent();
      seed(component, [
        { valueConditionType: EQUALS, borrowerCycleNumber: 1, defaultValue: 20000 },
        { valueConditionType: GREATER_THAN, borrowerCycleNumber: 1, defaultValue: 35000 }
      ]);

      expect(component.sectionErrorKey(component.sections[0])).toBeNull();
      expect(component.isValid).toBe(true);
    });

    it('accepts several explicit cycles before the open-ended row', () => {
      const component = createComponent();
      seed(component, [
        { valueConditionType: EQUALS, borrowerCycleNumber: 1, defaultValue: 20000 },
        { valueConditionType: EQUALS, borrowerCycleNumber: 2, defaultValue: 27000 },
        { valueConditionType: GREATER_THAN, borrowerCycleNumber: 2, defaultValue: 35000 }
      ]);

      expect(component.sectionErrorKey(component.sections[0])).toBeNull();
    });

    it('rejects a greater-than row that advances instead of repeating the number above it', () => {
      // Exactly the shape the backend rejected with args (found 2, expected 1).
      const component = createComponent();
      seed(component, [
        { valueConditionType: EQUALS, borrowerCycleNumber: 1, defaultValue: 20000 },
        { valueConditionType: GREATER_THAN, borrowerCycleNumber: 2, defaultValue: 35000 }
      ]);

      expect(component.sectionErrorKey(component.sections[0])).toBe(
        'labels.text.A row with the greater than condition must repeat the cycle number above it'
      );
    });

    it('accepts a fully populated, valid configuration across all three sections', () => {
      // Regression: an earlier revision matched the condition on the option `code` first and returned
      // "not greater than" whenever the spelling was unfamiliar, which flagged this valid setup and
      // left the Create button silently dead. Ids are the contract, so they are matched first now.
      const component = createComponent();
      const rows: Array<[
          number,
          BorrowerCycleVariation[]
        ]> = [
        [
          0,
          [
            { valueConditionType: EQUALS, borrowerCycleNumber: 1, defaultValue: 20000 },
            { valueConditionType: GREATER_THAN, borrowerCycleNumber: 1, defaultValue: 35000 }
          ]
        ],
        [
          1,
          [
            { valueConditionType: EQUALS, borrowerCycleNumber: 1, defaultValue: 12 },
            { valueConditionType: GREATER_THAN, borrowerCycleNumber: 1, defaultValue: 24 }
          ]
        ],
        [
          2,
          [
            { valueConditionType: EQUALS, borrowerCycleNumber: 1, defaultValue: 24 },
            { valueConditionType: GREATER_THAN, borrowerCycleNumber: 1, defaultValue: 22 }
          ]
        ]
      ];
      rows.forEach(
        ([
          sectionIndex,
          variations
        ]) => {
          variations.forEach((variation) => {
            dialogResponse = { data: variationGroup(variation) };
            component.add(component.sections[sectionIndex]);
          });
        }
      );

      component.sections.forEach((section) => {
        expect([
          section.key,
          component.sectionErrorKey(section)
        ]).toEqual([
          section.key,
          null
        ]);
      });
      expect(component.isValid).toBe(true);
    });

    it('never blocks on a condition it cannot classify', () => {
      // A guard that rejects a valid product is worse than one that defers to the backend, so an
      // unrecognised condition id with no matching code must pass through.
      const component = createComponent();
      dialogResponse = { data: variationGroup({ valueConditionType: 99, borrowerCycleNumber: 1, defaultValue: 1 }) };
      component.add(component.sections[0]);
      dialogResponse = { data: variationGroup({ valueConditionType: 99, borrowerCycleNumber: 2, defaultValue: 2 }) };
      component.add(component.sections[0]);

      expect(component.sectionErrorKey(component.sections[0])).toBeNull();
      expect(component.isValid).toBe(true);
    });

    it('classifies by id even when the option code uses an unfamiliar spelling', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          LoanProductBorrowerCycleStepComponent,
          { provide: UntypedFormBuilder, useClass: UntypedFormBuilder },
          { provide: MatDialog, useValue: dialogStub },
          { provide: TranslateService, useValue: { instant: (key: string) => key } }
        ]
      });
      const component = TestBed.inject(LoanProductBorrowerCycleStepComponent);
      component.loanProductsTemplate = {
        valueConditionTypeOptions: [
          { id: 2, code: 'some.other.namespace.Equal', value: 'equals' },
          { id: 3, code: 'some.other.namespace.GreaterThan', value: 'greater than' }
        ]
      };
      component.ngOnInit();
      [
        { valueConditionType: EQUALS, borrowerCycleNumber: 1, defaultValue: 20000 },
        { valueConditionType: GREATER_THAN, borrowerCycleNumber: 1, defaultValue: 35000 }
      ].forEach((variation) => {
        dialogResponse = { data: variationGroup(variation) };
        component.add(component.sections[0]);
      });

      expect(component.sectionErrorKey(component.sections[0])).toBeNull();
    });

    it('rejects a list that does not start with equals', () => {
      const component = createComponent();
      seed(component, [{ valueConditionType: GREATER_THAN, borrowerCycleNumber: 1, defaultValue: 1500 }]);

      expect(component.sectionErrorKey(component.sections[0])).toBe(
        'errors.validation.msg.loanproduct.principalCycleNumbers.condition.type.must.start.with.equal'
      );
      expect(component.isValid).toBe(false);
    });

    it('rejects a list that does not end with greater than', () => {
      const component = createComponent();
      seed(component, [
        { valueConditionType: EQUALS, borrowerCycleNumber: 1, defaultValue: 20000 },
        { valueConditionType: EQUALS, borrowerCycleNumber: 2, defaultValue: 35000 }
      ]);

      expect(component.sectionErrorKey(component.sections[0])).toBe(
        'errors.validation.msg.loanproduct.principalCycleNumbers.condition.type.must.end.with.greterthan'
      );
    });

    it('rejects a single row, which cannot be both first and last', () => {
      const component = createComponent();
      seed(component, [{ valueConditionType: EQUALS, borrowerCycleNumber: 1, defaultValue: 20000 }]);

      expect(component.sectionErrorKey(component.sections[0])).toBe(
        'errors.validation.msg.loanproduct.principalCycleNumbers.condition.type.must.end.with.greterthan'
      );
    });

    it('rejects equals rows that do not run consecutively from 1', () => {
      const component = createComponent();
      seed(component, [
        { valueConditionType: EQUALS, borrowerCycleNumber: 2, defaultValue: 20000 },
        { valueConditionType: GREATER_THAN, borrowerCycleNumber: 2, defaultValue: 35000 }
      ]);

      expect(component.sectionErrorKey(component.sections[0])).toBe(
        'labels.text.Rows with the equals condition must be numbered consecutively from 1'
      );
    });

    it('reports the error against the section it belongs to', () => {
      // Each list maps to its own backend parameter, so the operator is told which table is wrong.
      const component = createComponent();
      dialogResponse = {
        data: variationGroup({ valueConditionType: GREATER_THAN, borrowerCycleNumber: 1, defaultValue: 12 })
      };
      component.add(component.sections[1]);

      expect(component.sectionErrorKey(component.sections[0])).toBeNull();
      expect(component.sectionErrorKey(component.sections[1])).toBe(
        'errors.validation.msg.loanproduct.repaymentCycleNumber.condition.type.must.start.with.equal'
      );
      expect(component.isValid).toBe(false);
    });

    it('falls back to the documented enum ids when the template carries no codes', () => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          LoanProductBorrowerCycleStepComponent,
          { provide: UntypedFormBuilder, useClass: UntypedFormBuilder },
          { provide: MatDialog, useValue: dialogStub },
          { provide: TranslateService, useValue: { instant: (key: string) => key } }
        ]
      });
      const component = TestBed.inject(LoanProductBorrowerCycleStepComponent);
      component.loanProductsTemplate = { valueConditionTypeOptions: [
          { id: 2 },
          { id: 3 }
        ] };
      component.ngOnInit();
      seed(component, [
        { valueConditionType: EQUALS, borrowerCycleNumber: 1, defaultValue: 20000 },
        { valueConditionType: GREATER_THAN, borrowerCycleNumber: 1, defaultValue: 35000 }
      ]);

      expect(component.sectionErrorKey(component.sections[0])).toBeNull();
    });
  });

  it('survives a template with no value condition options', () => {
    // The wizard renders the step as soon as the profile and toggle allow it; a template that has not
    // resolved yet must not throw when the dialog is opened.
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        LoanProductBorrowerCycleStepComponent,
        { provide: UntypedFormBuilder, useClass: UntypedFormBuilder },
        { provide: MatDialog, useValue: dialogStub },
        { provide: TranslateService, useValue: { instant: (key: string) => key } }
      ]
    });
    const component = TestBed.inject(LoanProductBorrowerCycleStepComponent);
    component.loanProductsTemplate = {};
    component.ngOnInit();
    dialogResponse = { data: undefined };

    expect(() => component.add(component.sections[0])).not.toThrow();
    expect(component.valueConditionTypeData).toEqual([]);
    // `SelectBase` normalizes an absent value to '', so the select simply renders with no selection
    // and no options rather than blowing up on `valueConditionTypeData[0].id`.
    expect(lastDialogData.formfields[0].value).toBe('');
    expect(lastDialogData.formfields[0].options.data).toEqual([]);
  });
});
