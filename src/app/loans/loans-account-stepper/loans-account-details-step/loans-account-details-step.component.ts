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
  ChangeDetectorRef,
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  DestroyRef,
  inject
} from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, UntypedFormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { SettingsService } from 'app/settings/settings.service';
import { TranslateService } from '@ngx-translate/core';

/** Custom Services */
import { LoansService } from '../../loans.service';
import { Commons } from 'app/core/utils/commons';
import { ReplaySubject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatTooltip } from '@angular/material/tooltip';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { AsyncPipe } from '@angular/common';
import { MatDivider } from '@angular/material/divider';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatStepperPrevious, MatStepperNext } from '@angular/material/stepper';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { LoanProductBasicDetails } from 'app/loans/models/loan-product.model';
import { LoanProductService } from 'app/products/loan-products/services/loan-product.service';
import { MatSelectChange, MatSelectTrigger } from '@angular/material/select';
import { LoanProductBaseComponent } from 'app/products/loan-products/common/loan-product-base.component';

/**
 * Loans Account Details Step
 */
@Component({
  selector: 'mifosx-loans-account-details-step',
  templateUrl: './loans-account-details-step.component.html',
  styleUrls: ['./loans-account-details-step.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatTooltip,
    NgxMatSelectSearchModule,
    MatDivider,
    MatCheckbox,
    MatStepperPrevious,
    FaIconComponent,
    MatStepperNext,
    MatSelectTrigger,
    AsyncPipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoansAccountDetailsStepComponent extends LoanProductBaseComponent implements OnInit {
  private formBuilder = inject(UntypedFormBuilder);
  private loansService = inject(LoansService);
  private route = inject(ActivatedRoute);
  private translateService = inject(TranslateService);
  private settingsService = inject(SettingsService);
  private commons = inject(Commons);
  private cdr = inject(ChangeDetectorRef);

  //** Defining PlaceHolders for the search bar */
  placeHolderLabel = '';
  noEntriesFoundLabel = '';

  /** Loans Account Template */
  @Input() loansAccountTemplate: any;
  /** Loan Product Basic Details lists */
  @Input() loanProductsBasicDetails: LoanProductBasicDetails[];

  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date(2100, 0, 1);
  /** Product Data */
  productList: any;
  /** Loan Officer Data */
  loanOfficerOptions: any;
  /** Loan Purpose Options */
  loanPurposeOptions: any;
  /** Fund Options */
  fundOptions: any;
  /** Account Linking Options */
  accountLinkingOptions: any;
  /** For edit loan accounts form */
  isFieldOfficerPatched = false;
  /** Loans Account Details Form */
  loansAccountDetailsForm: UntypedFormGroup;

  loanId: any = null;

  loanProductSelected = false;
  /** Currency data. */
  protected productData: ReplaySubject<string[]> = new ReplaySubject<string[]>(1);
  /** control for the filter select */
  protected filterFormCtrl: UntypedFormControl = new UntypedFormControl('');
  private destroyRef = inject(DestroyRef);

  productSelected: LoanProductBasicDetails | null = null;

  /** Loans Account Template with product data  */
  @Output() loansAccountProductTemplate = new EventEmitter();
  @Output() loansProductType = new EventEmitter();
  /**
   * Sets loans account details form.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {LoansService} loansService Loans Service.
   * @param {SettingsService} settingsService SettingsService
   */
  constructor() {
    super();
    this.loanId = this.route.snapshot.params['loanId'];
    this.createLoansAccountDetailsForm();
  }

  ngOnInit() {
    this.placeHolderLabel = this.translateService.instant('labels.text.Search');
    this.noEntriesFoundLabel = this.translateService.instant('labels.text.No data found');
    this.maxDate = this.settingsService.maxFutureDate;
    this.productList = this.loanProductsBasicDetails
      ? this.loanProductsBasicDetails.sort(this.commons.dynamicSort('name'))
      : [];
    if (this.loansAccountTemplate) {
      this.addFormControlsBasedOnProductType();
      let loanProductId: number | null = null;
      this.loansAccountDetailsForm.patchValue({
        fundId: this.loansAccountTemplate.fundId,
        submittedOnDate:
          this.loansAccountTemplate.timeline.submittedOnDate &&
          new Date(this.loansAccountTemplate.timeline.submittedOnDate),
        expectedDisbursementDate:
          this.loansAccountTemplate.timeline.expectedDisbursementDate &&
          new Date(this.loansAccountTemplate.timeline.expectedDisbursementDate),
        externalId: this.loansAccountTemplate.externalId
      });
      if (this.loansAccountTemplate.loanProductId) {
        loanProductId = this.loansAccountTemplate.loanProductId;
        this.loansAccountDetailsForm.patchValue({
          loanOfficerId: this.loansAccountTemplate.loanOfficerId,
          loanPurposeId: this.loansAccountTemplate.loanPurposeId
        });
      } else if (this.loanProductService.isWorkingCapital && this.loansAccountTemplate.product) {
        loanProductId = this.loansAccountTemplate.product.id;
      }
      this.productSelected = this.loanProductsBasicDetails.find(
        (p: LoanProductBasicDetails) =>
          p.productType === this.loanProductService.productType.value && p.id === loanProductId
      );
      if (this.productSelected) {
        this.loansAccountDetailsForm.patchValue({
          productId: this.productSelected.shortName
        });
        this.loanProductSelected = true;
        this.getProductTemplate(false);
      }
    }
    this.filterFormCtrl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.searchItem();
    });
    this.productData.next(this.productList.slice());
  }

  searchItem(): void {
    if (this.productList) {
      const search: string = this.filterFormCtrl.value.toLowerCase();

      if (!search) {
        this.productData.next(this.productList.slice());
      } else {
        this.productData.next(
          this.productList.filter((option: any) => {
            return (
              option['name'].toLowerCase().indexOf(search) >= 0 ||
              option['shortName'].toLowerCase().indexOf(search) >= 0
            );
          })
        );
      }
    }
  }

  /**
   * Creates loans account details form.
   */
  createLoansAccountDetailsForm() {
    this.loansAccountDetailsForm = this.formBuilder.group({
      productId: [''],
      fundId: [''],
      submittedOnDate: [
        this.settingsService.businessDate,
        Validators.required
      ],
      expectedDisbursementDate: [
        '',
        Validators.required
      ],
      externalId: ['']
    });
  }

  /**
   * Returns loans account details form value.
   */
  get loansAccountDetails() {
    if (this.productSelected) {
      const loanAccountDetails = {
        ...this.loansAccountDetailsForm.getRawValue(),
        productId: this.productSelected.id
      };
      return loanAccountDetails;
    }
    return null;
  }

  getLoanProductType(productType: string) {
    return LoanProductService.productTypeLabel(productType);
  }

  productChange(event: MatSelectChange): void {
    const productShortName = event.value;
    this.productSelected = this.loanProductsBasicDetails.find(
      (p: LoanProductBasicDetails) => p.shortName === productShortName
    );
    this.getProductTemplate(true);
  }

  getProductTemplate(emitEvent: boolean): void {
    if (this.productSelected) {
      this.loanProductService.initialize(this.productSelected.productType);
      if (emitEvent) {
        this.loansProductType.emit(this.productSelected.productType);
        this.addFormControlsBasedOnProductType();
      }
      if (this.loanProductService.isLoanProduct) {
        const entityId = this.loansAccountTemplate.clientId
          ? this.loansAccountTemplate.clientId
          : this.loansAccountTemplate.group
            ? this.loansAccountTemplate.group.id
            : null;

        const isGroup: boolean = this.loansAccountTemplate.clientId ? false : true;
        this.loansService
          .getLoansAccountTemplateResource(entityId, isGroup, this.productSelected.id)
          .subscribe((response: any) => {
            this.loansAccountProductTemplate.emit(response);
            this.loanOfficerOptions = response.loanOfficerOptions;
            this.loanPurposeOptions = response.loanPurposeOptions;
            this.fundOptions = response.fundOptions;
            this.accountLinkingOptions = response.accountLinkingOptions;
            this.loanProductSelected = true;
            if (response.createStandingInstructionAtDisbursement) {
              this.loansAccountDetailsForm
                .get('createStandingInstructionAtDisbursement')
                .patchValue(response.createStandingInstructionAtDisbursement);
            }
            this.cdr.markForCheck();
          });
      } else if (this.loanProductService.isWorkingCapital) {
        const entityId = this.loansAccountTemplate.client
          ? this.loansAccountTemplate.client.id
          : this.route.parent.snapshot.params['clientId'];
        this.loansService
          .getWorkingCapitalLoansAccountTemplate(entityId, this.productSelected.id)
          .subscribe((response: any) => {
            this.loansAccountProductTemplate.emit(response);
            this.fundOptions = response.fundOptions;
            if (emitEvent) {
              this.loansAccountDetailsForm.patchValue({
                fundId: response.loanData.fundId
              });
            }
            this.loanProductSelected = true;
            this.cdr.markForCheck();
          });
      } else {
        console.log(this.productSelected.productType + ' not implemented');
      }
    }
  }

  addFormControlsBasedOnProductType(): void {
    const loanOnlyControls: Record<string, UntypedFormControl> = {
      loanOfficerId: new UntypedFormControl(''),
      loanPurposeId: new UntypedFormControl(''),
      linkAccountId: new UntypedFormControl(''),
      createStandingInstructionAtDisbursement: new UntypedFormControl('')
    };

    if (this.loanProductService.isLoanProduct) {
      Object.entries(loanOnlyControls).forEach(
        ([
          name,
          control
        ]) => {
          if (!this.loansAccountDetailsForm.contains(name)) {
            this.loansAccountDetailsForm.addControl(name, control);
          }
        }
      );
      return;
    }

    Object.keys(loanOnlyControls).forEach((name) => {
      if (this.loansAccountDetailsForm.contains(name)) {
        this.loansAccountDetailsForm.removeControl(name);
      }
    });
  }
}
