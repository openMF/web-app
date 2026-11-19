/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import {
  ChangeDetectionStrategy,
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  QueryList,
  ViewChild,
  ViewChildren,
  inject
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

/** Custom Services */
import { LoansService } from '../loans.service';
import { SettingsService } from 'app/settings/settings.service';
import { ClientsService } from 'app/clients/clients.service';
import { LoanEligibilityDialogComponent } from 'app/loans/loan-eligibility/loan-eligibility-dialog/loan-eligibility-dialog.component';
import { ApplicationCollateralItem } from 'app/loans/loan-eligibility/loan-eligibility.models';

/** Step Components */
import { LoansAccountDetailsStepComponent } from '../loans-account-stepper/loans-account-details-step/loans-account-details-step.component';
import { LoansAccountTermsStepComponent } from '../loans-account-stepper/loans-account-terms-step/loans-account-terms-step.component';
import { LoansAccountChargesStepComponent } from '../loans-account-stepper/loans-account-charges-step/loans-account-charges-step.component';
import { LoansAccountDatatableStepComponent } from '../loans-account-stepper/loans-account-datatable-step/loans-account-datatable-step.component';
import { MatStepper, MatStepperIcon, MatStep, MatStepLabel } from '@angular/material/stepper';
import { MatIcon } from '@angular/material/icon';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { LoansAccountScheduleStepComponent } from '../loans-account-stepper/loans-account-schedule-step/loans-account-schedule-step.component';
import { LoansAccountPreviewStepComponent } from '../loans-account-stepper/loans-account-preview-step/loans-account-preview-step.component';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { LoanProductBasicDetails } from '../models/loan-product.model';
import { LoanProductBaseComponent } from 'app/products/loan-products/common/loan-product-base.component';
import { Dates } from 'app/core/utils/dates';
import { Datatables } from 'app/core/utils/datatables';
import { LoansAccountDocumentsStepComponent } from '../loans-account-stepper/loans-account-documents-step/loans-account-documents-step.component';
import { catchError, concatMap, from, map, of, toArray } from 'rxjs';

/**
 * Create loans account
 */
@Component({
  selector: 'mifosx-create-loans-account',
  templateUrl: './create-loans-account.component.html',
  styleUrls: ['./create-loans-account.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatStepper,
    MatStepperIcon,
    FaIconComponent,
    MatStep,
    MatStepLabel,
    LoansAccountDetailsStepComponent,
    LoansAccountTermsStepComponent,
    LoansAccountChargesStepComponent,
    LoansAccountScheduleStepComponent,
    LoansAccountDatatableStepComponent,
    LoansAccountPreviewStepComponent,
    LoansAccountDocumentsStepComponent,
    MatIcon
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateLoansAccountComponent extends LoanProductBaseComponent implements AfterViewInit {
  private readonly destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute);
  private loansService = inject(LoansService);
  private settingsService = inject(SettingsService);
  private clientService = inject(ClientsService);
  private cdr = inject(ChangeDetectorRef);
  private dateUtils = inject(Dates);
  private dialog = inject(MatDialog);
  readonly datatablesUtil = inject(Datatables);

  /** Imports all the step component */
  @ViewChild(LoansAccountDetailsStepComponent, { static: false })
  loansAccountDetailsStep: LoansAccountDetailsStepComponent;
  @ViewChild(LoansAccountTermsStepComponent, { static: false }) loansAccountTermsStep: LoansAccountTermsStepComponent;
  @ViewChild(LoansAccountChargesStepComponent, { static: false })
  loansAccountChargesStep: LoansAccountChargesStepComponent;
  /** Get handle on dtloan tags in the template */
  @ViewChildren('dtloan') loanDatatables: QueryList<LoansAccountDatatableStepComponent>;
  /** The steps holding them, in the same order, to open the first one left incomplete. */
  @ViewChildren('dtstep') datatableSteps: QueryList<MatStep>;
  @ViewChild(LoansAccountDocumentsStepComponent) documentsStep: LoansAccountDocumentsStepComponent;
  @ViewChild('documentsMatStep') documentsMatStep: MatStep;

  /** Loans Account Template */
  loansAccountTemplate: any;
  /** Loans Account Product Template */
  loansAccountProductTemplate: any | null = null;
  /** Collateral Options */
  collateralOptions: any;
  /** Multi Disburse Loan */
  multiDisburseLoan: any;
  /** Principal Amount */
  principal: any;
  datatables: any = [];
  /** Currency Code */
  currencyCode: string;

  clientId: number | null = null;
  productId: number | null = null;
  productDetails: any;

  loanProductsBasicDetails: LoanProductBasicDetails[] | null = null;
  productType: string | null = null;

  /**
   * Sets loans account create form.
   * @param {route} ActivatedRoute Activated Route.
   * @param {router} Router Router.
   * @param {loansService} LoansService Loans Service
   * @param {SettingsService} settingsService Settings Service
   * @param {ClientsService} clientService Client Service
   */
  constructor() {
    super();
    this.loanProductsBasicDetails = [];
    this.route.data
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data: { loansAccountTemplate: any; loanProductsBasicDetails: LoanProductBasicDetails[] }) => {
        this.loanProductsBasicDetails = data.loanProductsBasicDetails;
        this.loansAccountTemplate = data.loansAccountTemplate;
      });
  }

  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  /**
   * Sets loans account product template and collateral template
   * @param {any} $event API response
   */
  setTemplate($event: any): void {
    const templateData: any = $event;
    this.loansAccountProductTemplate = templateData;
    if (templateData.loanData) {
      this.loansAccountProductTemplate = templateData.loanData;
      this.loansAccountProductTemplate.options = {
        breachOptions: templateData.breachOptions,
        nearBreachOptions: templateData.nearBreachOptions,
        delinquencyBucketOptions: templateData.delinquencyBucketOptions,
        fundOptions: templateData.fundOptions,
        periodFrequencyTypeOptions: templateData.periodFrequencyTypeOptions,
        delinquencyStartTypeOptions: templateData.delinquencyStartTypeOptions
      };
    }
    this.currencyCode = this.loansAccountProductTemplate.currency.code;
    this.productId = this.loansAccountProductTemplate.product.id;
    this.productDetails = this.loansAccountProductTemplate.product;

    if (this.loanProductService.isLoanProduct) {
      const clientId = this.loansAccountTemplate.clientId;
      if (!!clientId) {
        this.clientService.getCollateralTemplate(clientId).subscribe((response: any) => {
          this.collateralOptions = response;
        });
      } else {
        // Fineract API doesn't have "Group Collateral Management" endpoint; from the obsolete
        // community app it appears getCollateralTemplate(clientId) is called as well, but it's not clear how
        // the clientId is selected from the clientIds that belong to the group.
        console.error('No collateral data requested from Fineract, collateral might misbehave');
      }
      this.multiDisburseLoan = this.loansAccountProductTemplate.multiDisburseLoan;
      this.setDatatables();
    }
    this.cdr.detectChanges();
  }

  setProductType($event: any): void {
    this.productType = $event;
    this.loanProductService.initialize(this.productType);
  }

  setDatatables(): void {
    this.datatables = [];

    if (this.loansAccountProductTemplate.datatables) {
      this.loansAccountProductTemplate.datatables.forEach((datatable: any) => {
        this.datatables.push(datatable);
      });
    }
  }

  /** Get Loans Account Details Form Data */
  get loansAccountDetailsForm() {
    return this.loansAccountDetailsStep?.loansAccountDetailsForm;
  }

  /** Get Loans Account Terms Form Data */
  get loansAccountTermsForm() {
    return this.loansAccountTermsStep?.loansAccountTermsForm;
  }

  /** Checks wheter all the forms in different steps are valid or not */
  get loansAccountFormValid() {
    return this.loansAccountDetailsForm?.valid && this.loansAccountTermsForm?.valid;
  }

  get loansSavingsAccountLinked() {
    if (this.loanProductService.isLoanProduct) {
      return this.loansAccountDetailsStep?.loansAccountDetailsForm.get('linkAccountId').value;
    }
    return null;
  }

  /** Gets principal Amount */
  get loanPrincipal() {
    return this.loansAccountTermsStep?.loansAccountTermsForm.value.principalAmount;
  }

  /**
   * "Collateral on this application" (fineract-dbug #154): each item added on the Terms step, by name and value
   * (quantity × basePrice) - the clerk picks the matching kind when checking eligibility, since this list alone
   * doesn't say which collateral product an item is.
   */
  get applicationCollateral(): ApplicationCollateralItem[] {
    const items: any[] = this.loansAccountTermsStep?.collateralDataSource ?? [];
    return items.map((item) => ({ name: item.type.name, value: item.value * item.type.basePrice }));
  }

  /** "Check eligibility" (fineract-dbug #154; docs/loan-eligibility.md): a member loan only, not group or GLIM. */
  checkEligibility(): void {
    this.dialog.open(LoanEligibilityDialogComponent, {
      data: {
        clientId: this.loansAccountTemplate.clientId,
        amount: this.loanPrincipal ?? undefined,
        applicationCollateral: this.applicationCollateral
      },
      width: '640px',
      maxWidth: '96vw',
      autoFocus: false
    });
  }

  /** Retrieves Data of all forms except Currency to submit the data */
  get loansAccount() {
    if (this.loanProductService.isLoanProduct) {
      return {
        ...this.loansAccountDetailsStep.loansAccountDetails,
        ...this.loansAccountTermsStep?.loansAccountTerms,
        ...this.loansAccountChargesStep?.loansAccountCharges,
        ...this.loansAccountTermsStep?.loanCollateral,
        ...this.loansAccountTermsStep?.disbursementData
      };
    } else if (this.loanProductService.isWorkingCapital) {
      return {
        ...this.loansAccountDetailsStep.loansAccountDetails,
        ...this.loansAccountTermsStep?.loansAccountTerms
      };
    }
    console.warn('Unexpected product type in loansAccount getter');
    return {};
  }

  submit(): void {
    if (this.loanProductService.isLoanProduct) {
      this.submitLoanProduct();
    } else if (this.loanProductService.isWorkingCapital) {
      this.submitWorkingCapitalProduct();
    }
  }

  /** Opens the first section or the documents step with a missing or wrong value; false when all are fine. */
  private openIncompleteStep(): boolean {
    const sections = this.loanDatatables.toArray();
    const invalid = sections.findIndex((section) => section.form.invalid);
    if (invalid >= 0) {
      sections.forEach((section) => section.form.markAllAsTouched());
      this.datatableSteps.get(invalid).select();
      return true;
    }
    if (this.documentsStep?.form.invalid) {
      this.documentsStep.form.markAllAsTouched();
      this.documentsMatStep.select();
      return true;
    }
    return false;
  }

  submitLoanProduct() {
    if (this.openIncompleteStep()) {
      return;
    }
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const payload = this.loansService.buildLoanRequestPayload(
      this.loansAccount,
      this.loansAccountTemplate,
      this.loansAccountProductTemplate.calendarOptions,
      locale,
      dateFormat
    );

    if (this.loansAccountProductTemplate.datatables && this.loansAccountProductTemplate.datatables.length > 0) {
      const datatables: any[] = [];
      this.loanDatatables.forEach((loanDatatable: LoansAccountDatatableStepComponent) => {
        datatables.push(loanDatatable.payload);
      });
      payload['datatables'] = datatables;
    }

    const documents = this.documentsStep?.documents ?? [];
    this.loansService
      .createLoansAccount(this.loanProductService.loanAccountPath, payload)
      .pipe(
        // The loan exists now; a document that fails is reported by the error handler and can be added again from
        // the loan's Documents tab, so it does not stop the others or the move to the new loan.
        concatMap((response: any) =>
          from(documents).pipe(
            concatMap((document) =>
              this.loansService
                .loadLoanDocument(response.resourceId, this.documentFormData(document))
                .pipe(catchError(() => of(null)))
            ),
            toArray(),
            map(() => response)
          )
        )
      )
      .subscribe((response: any) => {
        this.router.navigate(
          [
            '../',
            response.resourceId,
            'general'
          ],
          {
            queryParams: {
              productType: this.loanProductService.productType.value
            },
            relativeTo: this.route
          }
        );
      });
  }

  private documentFormData(document: { file: File; name: string; description: string }): FormData {
    const formData = new FormData();
    formData.append('name', document.name);
    formData.append('file', document.file);
    formData.append('description', document.description);
    return formData;
  }

  submitWorkingCapitalProduct() {
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const payload = {
      ...this.loansAccount,
      clientId: this.loansAccountProductTemplate.client.id,
      submittedOnDate: this.dateUtils.formatDate(this.loansAccount.submittedOnDate, dateFormat),
      expectedDisbursementDate: this.dateUtils.formatDate(this.loansAccount.expectedDisbursementDate, dateFormat),
      locale,
      dateFormat
    };

    if (this.productDetails.allowAttributeOverrides) {
      if (
        !Object.hasOwn(this.productDetails.allowAttributeOverrides, 'periodPaymentFrequency') ||
        this.productDetails.allowAttributeOverrides.periodPaymentFrequency === false
      ) {
        delete payload['repaymentEvery'];
      }
      if (
        !Object.hasOwn(this.productDetails.allowAttributeOverrides, 'periodPaymentFrequencyType') ||
        this.productDetails.allowAttributeOverrides.periodPaymentFrequencyType === false
      ) {
        delete payload['repaymentFrequencyType'];
      }
      if (
        !Object.hasOwn(this.productDetails.allowAttributeOverrides, 'discountDefault') ||
        this.productDetails.allowAttributeOverrides.discountDefault === false
      ) {
        delete payload['discount'];
      }
      if (
        !Object.hasOwn(this.productDetails.allowAttributeOverrides, 'breach') ||
        this.productDetails.allowAttributeOverrides.breach === false
      ) {
        delete payload['breachId'];
        delete payload['nearBreachId'];
      }
    }

    // No Empty values to be sent
    [
      'delinquencyGraceDays',
      'delinquencyStartType'
    ].forEach((attr: string) => {
      if (payload[attr] === null || payload[attr] === '') {
        delete payload[attr];
      }
    });

    this.loansService
      .createLoansAccount(this.loanProductService.loanAccountPath, payload)
      .subscribe((response: any) => {
        this.router.navigate(
          [
            '../',
            response.resourceId,
            'general'
          ],
          {
            queryParams: {
              productType: this.loanProductService.productType.value
            },
            relativeTo: this.route
          }
        );
      });
  }
}
