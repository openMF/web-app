/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, inject } from '@angular/core';
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
import { AsyncPipe } from '@angular/common';
import { MatDivider } from '@angular/material/divider';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatStepperPrevious, MatStepperNext } from '@angular/material/stepper';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { DatePipe } from '@angular/common';

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
    AsyncPipe,
    DatePipe
  ]
})
export class LoansAccountDetailsStepComponent implements OnInit, OnDestroy {
  private formBuilder = inject(UntypedFormBuilder);
  private loansService = inject(LoansService);
  private route = inject(ActivatedRoute);
  private translateService = inject(TranslateService);
  private settingsService = inject(SettingsService);
  private commons = inject(Commons);

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
  /** Calendar/meeting options from JLG template */
  calendarOptions: any[] = [];
  /** Next meeting date (formatted) */
  nextMeetingDate: string | null = null;
  /** Whether this is a JLG loan (has calendar options) */
  isJlgLoan = false;
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
  constructor() {
    this.loanId = this.route.snapshot.params['loanId'];
    this.createLoansAccountDetailsForm();
  }

  ngOnInit() {
    this.placeHolderLabel = this.translateService.instant('labels.text.Search');
    this.noEntriesFoundLabel = this.translateService.instant('labels.text.No data found');
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
      createStandingInstructionAtDisbursement: [''],
      syncDisbursementWithMeeting: [false],
      syncRepaymentsWithMeeting: [false]
    });
  }

  /**
   * Fetches loans account product template on productId value changes
   */
  buildDependencies() {
    const clientId = this.loansAccountTemplate.clientId;
    const groupId = this.loansAccountTemplate.group?.id;
    // Determine if this is a JLG loan (has both clientId and groupId)
    this.isJlgLoan = !!(clientId && groupId);
    this.extractCalendarOptions(this.loansAccountTemplate);

    const entityId = clientId || groupId;
    const isGroup = !clientId;
    this.loansAccountDetailsForm.get('productId').valueChanges.subscribe((productId: string) => {
      const fetchTemplate$ = this.isJlgLoan
        ? this.loansService.getJlgLoanTemplate(clientId, groupId, productId)
        : this.loansService.getLoansAccountTemplateResource(entityId, isGroup, productId);

      fetchTemplate$.subscribe((response: any) => {
        this.loansAccountProductTemplate.emit(response);
        this.loanOfficerOptions = response.loanOfficerOptions;
        this.loanPurposeOptions = response.loanPurposeOptions;
        this.fundOptions = response.fundOptions;
        this.accountLinkingOptions = response.accountLinkingOptions;
        this.loanProductSelected = true;
        this.extractCalendarOptions(response);
        if (response.createStandingInstructionAtDisbursement) {
          this.loansAccountDetailsForm
            .get('createStandingInstructionAtDisbursement')
            .patchValue(response.createStandingInstructionAtDisbursement);
        }
      });
    });

    // When sync disbursement is toggled, auto-set disbursement date to next meeting
    this.loansAccountDetailsForm.get('syncDisbursementWithMeeting').valueChanges.subscribe((sync: boolean) => {
      if (sync && this.nextMeetingDate) {
        this.loansAccountDetailsForm.get('expectedDisbursementDate').patchValue(new Date(this.nextMeetingDate));
      }
    });
  }

  /**
   * Extracts calendar/meeting options from API response
   */
  private extractCalendarOptions(template: any) {
    if (template.calendarOptions && template.calendarOptions.length > 0) {
      this.calendarOptions = template.calendarOptions;
      const dates = template.calendarOptions[0].nextTenRecurringDates;
      if (dates && dates.length > 0) {
        // dates come as [year, month, day] arrays
        const d = dates[0];
        this.nextMeetingDate = new Date(d[0], d[1] - 1, d[2]).toISOString();
      }
    }
  }

  /**
   * Returns loans account details form value.
   */
  get loansAccountDetails() {
    return this.loansAccountDetailsForm.getRawValue();
  }
}
