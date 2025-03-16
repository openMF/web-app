/** Angular Imports */
import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, UntypedFormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { SettingsService } from 'app/settings/settings.service';

/** Custom Services */
import { LoansService } from '../../../../loans.service';
import { Commons } from 'app/core/utils/commons';
import { takeUntil } from 'rxjs/operators';
import { ReplaySubject, Subject } from 'rxjs';

// Felix: TODO's:
// - gsimData was already declared, when I found this file. Apparently,
// glim accounts can only be linked to gsim accounts. Needs to be tested
// as soon as gsim accounts are implemented.
/**
 * GLIM Account Details Step
 */
@Component({
  selector: 'mifosx-glim-details-step',
  templateUrl: './glim-details-step.component.html',
  styleUrls: ['./glim-details-step.component.scss']
})
export class GlimDetailsStepComponent implements OnInit, OnDestroy {
  /** Loans Account Template */
  @Input() loansAccountTemplate: any;
  @Input() gsimData: any;
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
    private settingsService: SettingsService,
    private commons: Commons
  ) {
    this.loanId = this.route.snapshot.params['loanId'];
  }

  ngOnInit(): void {
    this.createLoansAccountDetailsForm();
    this.maxDate = this.settingsService.maxFutureDate; // Felix: originally: businessDate;
    this.buildDependencies();
    if (this.loansAccountTemplate) {
      this.productList = this.loansAccountTemplate.productOptions.sort(this.commons.dynamicSort('name'));
      if (this.loansAccountTemplate.loanProductId) {
        console.log('this.loansAccountTemplate.loanOfficerId: ', this.loansAccountTemplate.loanOfficerId);
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
   * Creates glim account details form.
   */
  createLoansAccountDetailsForm() {
    this.loansAccountDetailsForm = this.formBuilder.group({
      productId: [
        '',
        Validators.required
      ],
      loanOfficerId: [''],
      // Felix: found: loanPurposeId: [''], - not sure, where we add this list...
      fundId: [''],
      submittedOnDate: [
        new Date(),
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
    const groupId = this.loansAccountTemplate.group.id;
    this.loansAccountDetailsForm.get('productId').valueChanges.subscribe((productId: string) => {
      this.loansService.getLoansAccountTemplateResource(groupId, true, productId).subscribe((response: any) => {
        this.loansAccountProductTemplate.emit(response);
        this.loanOfficerOptions = response.loanOfficerOptions;
        this.loanPurposeOptions = response.loanPurposeOptions;
        this.fundOptions = response.fundOptions;
        this.accountLinkingOptions = response.accountLinkingOptions;
        this.loanProductSelected = true;
      });
    });
  }

  /**
   * Returns loans account details form value.
   */
  get loansAccountDetails() {
    return this.loansAccountDetailsForm.getRawValue(); // Felix: was: value;
  }
}
