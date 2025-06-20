/** Angular Imports */
import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import {
  UntypedFormGroup,
  UntypedFormBuilder,
  Validators,
  UntypedFormControl,
  ReactiveFormsModule
} from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SettingsService } from 'app/settings/settings.service';
import { TranslateService } from '@ngx-translate/core';

/** Custom Services */
import { LoansService } from '../../loans.service';
import { Commons } from 'app/core/utils/commons';
import { takeUntil } from 'rxjs/operators';
import { ReplaySubject, Subject } from 'rxjs';
import { MatTooltip } from '@angular/material/tooltip';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { NgFor, NgIf, AsyncPipe } from '@angular/common';
import { MatDivider } from '@angular/material/divider';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatStepperPrevious, MatStepperNext } from '@angular/material/stepper';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

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
    AsyncPipe
  ]
})
export class LoansAccountDetailsStepComponent implements OnInit, OnDestroy {
  //** Defining PlaceHolders for the search bar */
  placeHolderLabel = '';
  noEntriesFoundLabel = '';

  /** Loans Account Template */
  @Input() loansAccountTemplate: any;

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
  /** Subject that emits when the component has been destroyed. */
  protected _onDestroy = new Subject<void>();

  /** Loans Account Template with product data  */
  @Output() loansAccountProductTemplate = new EventEmitter();
  /**
   * Sets loans account details form.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {LoansService} loansService Loans Service.
   * @param {SettingsService} settingsService SettingsService
   */
  constructor(
    private formBuilder: UntypedFormBuilder,
    private loansService: LoansService,
    private route: ActivatedRoute,
    private translateService: TranslateService,
    private settingsService: SettingsService,
    private commons: Commons
  ) {
    this.loanId = this.route.snapshot.params['loanId'];
  }

  ngOnInit() {
    this.placeHolderLabel = this.translateService.instant('labels.text.Search');
    this.noEntriesFoundLabel = this.translateService.instant('labels.text.No data found');
    this.createLoansAccountDetailsForm();
    this.maxDate = this.settingsService.maxFutureDate;
    this.buildDependencies();
    if (this.loansAccountTemplate) {
      this.productList = this.loansAccountTemplate.productOptions.sort(this.commons.dynamicSort('name'));
      if (this.loansAccountTemplate.loanProductId) {
        this.loansAccountDetailsForm.patchValue({
          productId: this.loansAccountTemplate.loanProductId,
          submittedOnDate:
            this.loansAccountTemplate.timeline.submittedOnDate &&
            new Date(this.loansAccountTemplate.timeline.submittedOnDate),
          loanOfficerId: this.loansAccountTemplate.loanOfficerId,
          loanPurposeId: this.loansAccountTemplate.loanPurposeId,
          fundId: this.loansAccountTemplate.fundId,
          expectedDisbursementDate:
            this.loansAccountTemplate.timeline.expectedDisbursementDate &&
            new Date(this.loansAccountTemplate.timeline.expectedDisbursementDate),
          externalId: this.loansAccountTemplate.externalId
        });
      }
    }
    this.filterFormCtrl.valueChanges.pipe(takeUntil(this._onDestroy)).subscribe(() => {
      this.searchItem();
    });
    this.productData.next(this.productList.slice());
  }

  ngOnDestroy(): void {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  searchItem(): void {
    if (this.productList) {
      const search: string = this.filterFormCtrl.value.toLowerCase();

      if (!search) {
        this.productData.next(this.productList.slice());
      } else {
        this.productData.next(
          this.productList.filter((option: any) => {
            return option['name'].toLowerCase().indexOf(search) >= 0;
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
      productId: [
        '',
        Validators.required
      ],
      loanOfficerId: [''],
      loanPurposeId: [''],
      fundId: [''],
      submittedOnDate: [
        this.settingsService.businessDate,
        Validators.required
      ],
      expectedDisbursementDate: [
        '',
        Validators.required
      ],
      externalId: [''],
      linkAccountId: [''],
      createStandingInstructionAtDisbursement: ['']
    });
  }

  /**
   * Fetches loans account product template on productId value changes
   */
  buildDependencies() {
    const entityId = this.loansAccountTemplate.clientId
      ? this.loansAccountTemplate.clientId
      : this.loansAccountTemplate.group.id;
    const isGroup = this.loansAccountTemplate.clientId ? false : true;
    this.loansAccountDetailsForm.get('productId').valueChanges.subscribe((productId: string) => {
      this.loansService.getLoansAccountTemplateResource(entityId, isGroup, productId).subscribe((response: any) => {
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
      });
    });
  }

  /**
   * Returns loans account details form value.
   */
  get loansAccountDetails() {
    return this.loansAccountDetailsForm.getRawValue();
  }
}
