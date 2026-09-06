/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DatePipe } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FontAwesomeTestingModule } from '@fortawesome/angular-fontawesome/testing';
import { MissingTranslationHandler } from '@ngx-translate/core';
import { CustomMissingTranslationHandler } from 'app/core/translation/missing-translation.handler';

import { LoanProductWizardComponent } from './loan-product-wizard.component';
import { LoanProducts } from '../loan-products';
import { LoanProductService } from '../services/loan-product.service';
import { ProductsService } from '../../products.service';
import { SettingsService } from 'app/settings/settings.service';

/**
 * The only spec in this folder that actually renders the wizard's template.
 *
 * Every other spec constructs the component with `new LoanProductWizardComponent()`, which cannot see
 * anything the Angular compiler decides about the template — and content projection is decided there.
 * `mat-form-field` collects its messages with `<ng-content select="mat-error">`, and the compiler can
 * only infer that selector for a control-flow block whose single root node is the element itself. Put
 * a `<mat-error>` inside a nested `@if` and it silently lands in the field's default slot instead:
 * it renders inside the box rather than in the subscript below it, and it appears immediately on a
 * pristine form because Material's touched/dirty gating never gets applied to it.
 */
describe('LoanProductWizardComponent (rendered)', () => {
  let fixture: ComponentFixture<LoanProductWizardComponent>;
  let component: LoanProductWizardComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        LoanProductWizardComponent,
        NoopAnimationsModule,
        TranslateModule.forRoot({
          // The wizard chrome leans on the app's own fallback rule: a `labels.catalogs` key the
          // bundles do not carry renders as the bare value. Registering the real handler is what
          // makes the option-label assertions below mean anything.
          missingTranslationHandler: { provide: MissingTranslationHandler, useClass: CustomMissingTranslationHandler }
        }),
        // The wizard chrome renders <fa-icon>s; the testing module stubs them out.
        FontAwesomeTestingModule
      ],
      providers: [
        DatePipe,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: ProductsService, useValue: { createLoanProduct: jest.fn() } },
        {
          provide: LoanProductService,
          useValue: { loanProductPath: '/loanproducts', productType: { value: 'loan' }, isLoanProduct: true }
        },
        { provide: SettingsService, useValue: { dateFormat: 'dd MMMM yyyy', language: { code: 'en' } } },
        {
          provide: LoanProducts,
          useValue: {
            buildPayload: (payload: Record<string, unknown>) => payload,
            ADVANCED_PAYMENT_ALLOCATION_STRATEGY: LoanProducts.ADVANCED_PAYMENT_ALLOCATION_STRATEGY
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoanProductWizardComponent);
    component = fixture.componentInstance;
    component.profileMode = 'personal';
    component.loanProductsTemplate = {
      currencyOptions: [{ code: 'KES', name: 'Kenyan Shilling' }],
      transactionProcessingStrategyOptions: [
        { code: LoanProducts.ADVANCED_PAYMENT_ALLOCATION_STRATEGY, name: 'Advanced Payment Allocation' }
      ],
      // The reused Classic steps read the template eagerly on init, so the shapes they touch have to
      // be present even though this spec only looks at the Details and Terms field grids.
      accountingMappingOptions: {
        assetAccountOptions: [],
        incomeAccountOptions: [],
        expenseAccountOptions: [],
        liabilityAccountOptions: []
      },
      accountingRuleOptions: [],
      chargeOptions: [],
      penaltyOptions: [],
      paymentTypeOptions: []
    };
    // `detectChanges(false)` skips the dev-mode check-no-changes pass. The wizard's accounting summary
    // getter returns a fresh object on every call, so that pass reports NG0100 for it — a pre-existing
    // issue in a part of the component this spec does not exercise, and not something to paper over by
    // changing the summary here.
    detect();
  });

  function detect(): void {
    fixture.detectChanges(false);
  }

  function nameField(): HTMLElement {
    // The Details step renders from the field config, so the product name is the first form field.
    return fixture.nativeElement.querySelector('.field-grid mat-form-field') as HTMLElement;
  }

  it('shows no validation message on a pristine form', () => {
    // `name` is required and empty from the first render. Material keeps that message hidden until the
    // control is touched, dirty or the form is submitted — a wizard that greets the user with two red
    // errors before they have typed anything is the symptom of a projection miss, not of validation.
    expect(component.form.get('name')!.hasError('required')).toBe(true);
    expect(nameField().querySelectorAll('mat-error').length).toBe(0);
  });

  it('shows the required message below the field once the control is touched', () => {
    const control = component.form.get('name')!;
    control.markAsTouched();
    detect();

    const error = nameField().querySelector('mat-error');
    expect(error).not.toBeNull();

    // Projected into the subscript wrapper — the strip under the box — rather than into the field's
    // default slot alongside the input, which is where a nested `@if` would have put it.
    expect(error!.closest('.mat-mdc-form-field-subscript-wrapper')).not.toBeNull();
    expect(error!.closest('.mat-mdc-form-field-flex')).toBeNull();
  });

  /**
   * `[formControlName]` is a property binding, so it leaves no attribute in the DOM to select on.
   * The label is the stable handle — with no translations loaded the `translate` pipe echoes the key.
   */
  function fieldByLabel(labelKey: string): HTMLElement {
    return Array.from(
      fixture.nativeElement.querySelectorAll('.field-grid mat-form-field') as NodeListOf<HTMLElement>
    ).find((field) => field.querySelector('mat-label')?.textContent?.trim() === labelKey)!;
  }

  it('renders the floor message for a value below the field minimum', () => {
    const control = component.form.get('principal')!;
    control.setValue(-50000);
    control.markAsTouched();
    detect();

    const error = fieldByLabel('labels.inputs.Principal Amount').querySelector('mat-error')!;
    expect(error.textContent).toContain('Minimum Value must be');
    expect(error.closest('.mat-mdc-form-field-subscript-wrapper')).not.toBeNull();
  });

  /**
   * With nothing loaded the `translate` pipe echoes the key, which is enough for the cases that only
   * need to prove a message rendered. The `errors.validation.*` messages carry the actual wording and
   * an interpolated value, so those assertions need the resolved string — the key alone would prove
   * neither. Values here mirror en-US.json.
   */
  /**
   * The chrome's own keys: step headers and the enum values the selects render. Only the entries the
   * assertions below read are loaded — `labels.catalogs` is deliberately given just two of them, so
   * the tenant-named values (the KES currency) exercise the fallback instead of a translation.
   * Values mirror en-US.json.
   */
  function loadChromeCopy(): void {
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation(
      'en',
      {
        labels: {
          heading: {
            Details: 'Details',
            Currency: 'Currency',
            Terms: 'Terms',
            Settings: 'Settings',
            Charges: 'Charges',
            Accounting: 'Accounting',
            'Payment Allocation': 'Payment Allocation',
            'Interest Refunds': 'Interest Refunds',
            'Deferred Income Recognition': 'Deferred Income Recognition',
            'Advanced Configuration': 'Advanced Configuration'
          },
          inputs: { 'Terms vary based on loan cycle': 'Terms vary based on loan cycle' },
          text: { 'max 4 chars': 'no more than 4 characters' },
          buttons: { Preview: 'Preview', Yes: 'Yes', No: 'No' },
          // Deliberately NOT the English these keys carry in en-US.json: a value that matched its own
          // key would pass whether or not the template pipes it, which is exactly the hole these
          // assertions exist to close.
          catalogs: { 'Per month': 'Monthly rate', 'Declining Balance': 'Reducing balance' }
        }
      },
      true
    );
    translate.use('en');
  }

  function loadValidationCopy(): void {
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation(
      'en',
      {
        errors: {
          'validation.maxLength': 'Maximum length is {{requiredLength}} characters',
          'validation.wholeNumber': 'Must be a whole number',
          'validation.maxDecimals': 'Up to {{decimals}} decimal places allowed'
        }
      },
      true
    );
    translate.use('en');
  }

  it('describes a maxlength failure as a character limit, not a numeric maximum', () => {
    loadValidationCopy();

    const control = component.form.get('name')!;
    control.setValue('n'.repeat(101));
    control.markAsTouched();
    detect();

    const error = nameField().querySelector('mat-error')!;
    expect(error.textContent).toContain('Maximum length is 100 characters');
    expect(error.closest('.mat-mdc-form-field-subscript-wrapper')).not.toBeNull();
  });

  it('renders the whole-number message for a fractional repayment count', () => {
    loadValidationCopy();

    const control = component.form.get('numberOfRepayments')!;
    control.setValue(2.5);
    control.markAsTouched();
    detect();

    const error = fieldByLabel('labels.inputs.Number of Repayments').querySelector('mat-error')!;
    expect(error.textContent).toContain('Must be a whole number');
  });

  it('states the decimal-place limit without claiming the value must be positive', () => {
    // `interestRatePerPeriod` is `min: 0, decimals: 6`, so zero is a legitimate rate. The format
    // message must not contradict that; the floor has its own message.
    loadValidationCopy();

    const control = component.form.get('interestRatePerPeriod')!;
    control.setValue(1.0000001);
    control.markAsTouched();
    detect();

    const error = fieldByLabel('labels.inputs.Annual interest rate').querySelector('mat-error')!;
    expect(error.textContent).toContain('Up to 6 decimal places allowed');
    expect(error.textContent!.toLowerCase()).not.toContain('positive');
  });

  it('accepts zero as an interest rate, with no message at all', () => {
    loadValidationCopy();

    const control = component.form.get('interestRatePerPeriod')!;
    control.setValue(0);
    control.markAsTouched();
    detect();

    expect(control.errors).toBeNull();
    expect(fieldByLabel('labels.inputs.Annual interest rate').querySelectorAll('mat-error').length).toBe(0);
  });

  /**
   * C4: "Create Loan Product" used to be a silent dead button — the guided branch of `submit()` called
   * `markAllAsTouched()` and returned, with no message, no stepper move and no disabled state. Since
   * the stepper is `[linear]="false"`, the operator reaches Review with an earlier step incomplete and
   * the offending control is usually not on screen, so the field-level messages that pass revealed
   * were invisible to them. These tests are DOM-level on purpose: the defect was that nothing
   * RENDERED, which the `new LoanProductWizardComponent()` specs in the sibling file cannot see.
   */
  describe('blocked submit on the guided Review step', () => {
    function createButton(): HTMLButtonElement {
      return Array.from(
        fixture.nativeElement.querySelectorAll('.step-actions button') as NodeListOf<HTMLButtonElement>
      ).find((button) => button.textContent?.trim() === 'labels.buttons.Create Loan Product')!;
    }

    function summary(): HTMLElement | null {
      return fixture.nativeElement.querySelector('.submit-blocked');
    }

    function listedSteps(): string[] {
      return Array.from(fixture.nativeElement.querySelectorAll('.submit-blocked__step') as NodeListOf<HTMLElement>).map(
        (step) => step.textContent!.trim()
      );
    }

    function clickCreate(): void {
      createButton().click();
      detect();
    }

    it('says nothing until the operator actually presses Create', () => {
      // The form is invalid from the first render (`name` is required and empty). A wizard that opens
      // by listing every step the operator has not reached yet is noise, not feedback.
      expect(component.guidedSubmitBlocked).toBe(true);
      expect(summary()).toBeNull();
    });

    it('names the steps that block the create instead of doing nothing', () => {
      clickCreate();

      expect(summary()).not.toBeNull();
      // Details owns the required, empty `name`, so it must be named. The wording of the whole list is
      // not pinned here — which other steps start incomplete is a property of the profile config.
      expect(listedSteps()).toContain('labels.heading.Details');
    });

    it('announces the summary to a screen reader', () => {
      // The accessibility face of C4: `markAllAsTouched()` reveals messages silently, so a
      // screen-reader user got no signal at all that the click had been rejected.
      clickCreate();

      expect(summary()!.getAttribute('role')).toBe('alert');
    });

    it('does not attempt the create while blocked', () => {
      const productsService = TestBed.inject(ProductsService);
      clickCreate();

      expect(productsService.createLoanProduct).not.toHaveBeenCalled();
    });

    it('jumps the stepper to a step named in the summary', () => {
      clickCreate();

      const details = component.incompleteGuidedSteps.find((step) => step.title === 'labels.heading.Details')!;
      const detailsButton = Array.from(
        fixture.nativeElement.querySelectorAll('.submit-blocked__step') as NodeListOf<HTMLButtonElement>
      ).find((button) => button.textContent!.trim() === 'labels.heading.Details')!;

      detailsButton.click();
      detect();

      expect(component.stepper!.selectedIndex).toBe(details.index);
    });

    it('keeps the step buttons across change detection so focus survives', () => {
      // `incompleteGuidedSteps` is a getter returning fresh objects, so without a trackBy Angular's
      // identity diffing rebuilds every button on each pass — and a button replaced under the
      // operator's focus is the same class of defect as the dead button this whole block fixes.
      clickCreate();
      const before = fixture.nativeElement.querySelector('.submit-blocked__step') as HTMLButtonElement;
      before.focus();

      detect();
      detect();

      const after = fixture.nativeElement.querySelector('.submit-blocked__step') as HTMLButtonElement;
      expect(after).toBe(before);
      expect(document.activeElement).toBe(before);
    });

    it('drops a step from the list once its fields are filled', () => {
      clickCreate();
      expect(listedSteps()).toContain('labels.heading.Details');

      // Every visible Details control that is currently invalid — the step is only listed because one
      // of its own fields is, so satisfying them all must remove it and leave the rest of the list.
      // Details is all text/date/checkbox, and its two required controls are `name` and `shortName`;
      // the filler is kept inside `shortName`'s 4-character limit so it satisfies rather than trades
      // one error for another.
      const detailsStep = component.visibleSteps.find((step) => step.title === 'labels.heading.Details')!;
      component.visibleFields(detailsStep).forEach((field) => {
        const control = component.form.get(field.key)!;
        if (control.invalid) {
          control.setValue('ABCD');
        }
      });
      detect();

      expect(component.visibleFields(detailsStep).every((field) => component.form.get(field.key)!.valid)).toBe(true);

      expect(listedSteps()).not.toContain('labels.heading.Details');
      expect(summary()).not.toBeNull();
    });
  });

  /**
   * C5: the reused Classic Accounting step ships its own trailing Previous/Next row
   * (`loan-product-accounting-step.component.html`), and the wizard shell renders a second, unified
   * one for every step via `.step-actions`. The Charges step has the identical row and was already
   * hidden with a `.wizard-charges ::ng-deep .layout-row.margin-t` rule; `.wizard-accounting` had no
   * matching rule, so the Accounting step showed both pairs stacked, in both guided and Custom/Advanced
   * mode. This is DOM-level for the same reason the C3 `mat-error` specs are: the defect is a second
   * set of buttons actually rendering, which the `new LoanProductWizardComponent()` specs cannot see.
   */
  it('does not stack a second Previous/Next pair on the Accounting step', () => {
    const accountingIndex = component.visibleSteps.findIndex((step) => step.kind === 'accounting');
    expect(accountingIndex).toBeGreaterThanOrEqual(0);
    component.stepper!.selectedIndex = accountingIndex;
    detect();

    // Vertical mat-stepper renders every step's content into the DOM at once (toggling visibility
    // rather than instantiating on demand), so `.step-actions` appears once per visible step — the
    // Accounting step's own row has to be picked out by position, matching `visibleSteps` order.
    // The wizard's own nav labels its buttons 'Back'/'Next'; the embedded step's labels its
    // 'Previous'/'Next' — different keys, so this also confirms which row is which.
    const wizardNav = fixture.nativeElement.querySelectorAll('.step-actions')[accountingIndex] as HTMLElement;
    const wizardNavLabels = Array.from(wizardNav.querySelectorAll('button') as NodeListOf<HTMLElement>).map((button) =>
      button.textContent!.trim()
    );
    expect(wizardNavLabels).toContain('labels.buttons.Back');
    expect(wizardNavLabels).toContain('labels.buttons.Next');

    // The embedded step still renders its own row in the DOM (it is a shared component, used
    // undecorated by Classic's own create flow) — this only asserts it is not visually shown here.
    // Confirms the hide selector still has something to target: jest-preset-angular does not compile
    // or inject component SCSS into this test's DOM (verified — no `<style>` in this suite ever
    // carries a `.wizard-accounting` or `.wizard-charges` rule, including the pre-existing Charges
    // one), so `getComputedStyle` on this element would read as visible whether or not the SCSS hide
    // rule exists. `loan-product-wizard.scss.spec.ts` covers the rule itself, from source; this half
    // covers the other way the fix could silently break — the embedded template dropping the
    // `layout-row`/`margin-t` classes the rule is written to match.
    const embeddedNav = fixture.nativeElement.querySelector('.wizard-accounting .layout-row.margin-t');
    expect(embeddedNav).not.toBeNull();
  });

  /**
   * I1: the wizard chrome bypassed i18n. Field labels and placeholders were keys, but everything
   * around them — the step headers, the select options, the field hints, the Review's section titles
   * and its Yes/No — was raw English hardcoded in the config, so a non-English operator got a
   * half-translated form. These are DOM-level because the defect is what the template does with the
   * string, which the `new LoanProductWizardComponent()` specs cannot see.
   */
  describe('translated wizard chrome', () => {
    beforeEach(() => {
      loadChromeCopy();
      detect();
    });

    it('translates the step headers', () => {
      const headers = Array.from(
        fixture.nativeElement.querySelectorAll('.mat-step-label') as NodeListOf<HTMLElement>
      ).map((header) => header.textContent!.trim());

      expect(headers).toContain('Details');
      expect(headers).toContain('Currency');
      // The last step is Classic's Preview, named from the key Classic already ships translated.
      expect(headers).toContain('Preview');
      // A raw key reaching the header is the exact defect; none may survive.
      expect(headers.some((header) => header.startsWith('labels.'))).toBe(false);
    });

    /**
     * `mat-select` renders its options lazily, into the CDK overlay attached to the document body —
     * so they exist nowhere until the trigger is clicked, and never inside the fixture's own element.
     */
    function openedOptions(labelKey: string): string[] {
      (fieldByLabel(labelKey).querySelector('.mat-mdc-select-trigger') as HTMLElement).click();
      detect();
      return Array.from(document.querySelectorAll('mat-option') as NodeListOf<HTMLElement>).map((option) =>
        option.textContent!.trim()
      );
    }

    it('translates select options through the catalogs namespace', () => {
      expect(openedOptions('labels.inputs.Interest rate frequency')).toContain('Monthly rate');
    });

    it('shows a tenant-named option as its own name rather than a key', () => {
      // The other half of the catalogs rule: 'Kenyan Shilling' is the tenant's currency, named by the
      // backend, and no bundle can carry a key for it. Without the fallback this select would read
      // 'labels.catalogs.Kenyan Shilling' — a worse result than the untranslated string it replaced.
      expect(openedOptions('labels.inputs.CURRENCY')).toContain('Kenyan Shilling');
    });

    it('translates the field hint', () => {
      const hint = fieldByLabel('labels.inputs.Short Name').querySelector('mat-hint');

      expect(hint!.textContent!.trim()).toBe('no more than 4 characters');
    });

    it('translates a checkbox value in the Review', () => {
      // `formatFieldValue` returned the literals 'Yes'/'No' from TypeScript, where no pipe could reach
      // them; they now resolve through `labels.buttons`, the pair the shared `yesNo` pipe uses.
      expect(component.formatValue('canUseForTopup', true)).toBe('Yes');
      expect(component.formatValue('canUseForTopup', false)).toBe('No');
    });

    it('names an enum value in the Review the way Classic names it', () => {
      expect(component.formatValue('interestType', 0)).toBe('Reducing balance');
    });
  });
});
