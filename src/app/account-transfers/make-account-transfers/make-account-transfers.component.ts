/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Component, OnInit, AfterViewInit, ViewChild, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AbstractControl,
  UntypedFormBuilder,
  UntypedFormGroup,
  ValidationErrors,
  Validators,
  FormsModule
} from '@angular/forms';

/** Custom Services */
import { AccountTransfersService } from '../account-transfers.service';
import { SettingsService } from 'app/settings/settings.service';
import { ClientsService } from 'app/clients/clients.service';
import { Dates } from 'app/core/utils/dates';

/** Environment Configuration */
import { environment } from '../../../environments/environment';
import { MatDivider } from '@angular/material/divider';
import { MatHint } from '@angular/material/form-field';
import { MatAutocompleteTrigger, MatAutocomplete } from '@angular/material/autocomplete';
import {
  MatStepper,
  MatStepperIcon,
  MatStep,
  MatStepLabel,
  MatStepperNext,
  MatStepperPrevious
} from '@angular/material/stepper';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Create account transfers
 */
@Component({
  selector: 'mifosx-make-account-transfers',
  templateUrl: './make-account-transfers.component.html',
  styleUrls: ['./make-account-transfers.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDivider,
    FormsModule,
    MatHint,
    MatAutocompleteTrigger,
    MatAutocomplete,
    MatStepper,
    MatStepperIcon,
    MatStep,
    MatStepLabel,
    MatStepperNext,
    MatStepperPrevious,
    FaIconComponent,
    CdkTextareaAutosize
  ]
})
export class MakeAccountTransfersComponent implements OnInit, AfterViewInit {
  private formBuilder = inject(UntypedFormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private accountTransfersService = inject(AccountTransfersService);
  private dateUtils = inject(Dates);
  private settingsService = inject(SettingsService);
  private clientsService = inject(ClientsService);

  /** Stepper reference */
  @ViewChild('transferStepper') transferStepper: MatStepper;

  /** Standing Instructions Data */
  accountTransferTemplateData: any;
  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date(2100, 0, 1);
  /** Beneficiary selection form (Step 1) */
  beneficiaryForm: UntypedFormGroup;
  /** Transfer details form (Step 2) */
  transferDetailsForm: UntypedFormGroup;
  /** To Office Type Data */
  toOfficeTypeData: any;
  /** To Client Type Data */
  toClientTypeData: any;
  /** To Account Type Data */
  toAccountTypeData: any;
  /** To Account Data */
  toAccountData: any;
  /** Account Type Id */
  accountTypeId: any;
  /** Account Type */
  accountType: any;
  /** Savings Id or Loans Id */
  id: any;
  /** Clients Data */
  clientsData: any;
  /** interbank transfer */
  interbank: boolean = false;
  /** Interbank transfer form flag */
  interbankTransferForm: boolean = false;
  balance: number = 0;
  isLoading: boolean = false;
  /** Transfer status flags (Step 3) */
  transferComplete: boolean = false;
  transferSuccess: boolean = false;
  transferErrorMessage: string = '';
  transferReferenceId: string = '';

  /**
   * Retrieves the standing instructions template from `resolve`.
   */
  constructor() {
    this.route.data.subscribe((data: { accountTransferTemplate: any }) => {
      this.accountTransferTemplateData = data.accountTransferTemplate;
      this.setParams();
      this.setOptions();
    });
  }

  /** Sets the value from the URL */
  setParams() {
    this.accountType = this.route.snapshot.queryParams['accountType'];
    switch (this.accountType) {
      case 'fromloans':
        this.accountTypeId = '1';
        this.id = this.route.snapshot.queryParams['loanId'];
        break;
      case 'fromsavings':
      case 'interbank':
        this.accountTypeId = '2';
        this.id = this.route.snapshot.queryParams['savingsId'];
        this.interbank = this.route.snapshot.queryParams['interbank'] === 'true';
        const navigationBalance = this.router.currentNavigation()?.extras?.state?.balance;
        const templateBalance =
          this.accountTransferTemplateData?.fromAccount?.availableBalance ??
          this.accountTransferTemplateData?.fromAccount?.summary?.accountBalance ??
          this.accountTransferTemplateData?.fromAccount?.balance ??
          0;
        this.balance = typeof navigationBalance === 'number' ? navigationBalance : templateBalance;
        break;
      default:
        this.accountTypeId = '0';
    }
  }

  /**
   * Creates and sets the beneficiary and transfer details forms.
   */
  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    if (!this.interbank) {
      this.createNormalBeneficiaryForm();
    } else {
      this.createEmptyInterbankBeneficiaryForm();
    }
    this.createTransferDetailsForm();
  }

  /**
   * Creates the beneficiary form for normal (non-interbank) transfers.
   */
  createNormalBeneficiaryForm() {
    this.beneficiaryForm = this.formBuilder.group({
      toOfficeId: [
        '',
        Validators.required
      ],
      toClientId: [
        '',
        Validators.required
      ],
      toAccountType: [
        '',
        Validators.required
      ],
      toAccountId: [
        '',
        Validators.required
      ]
    });
  }

  /**
   * Creates an empty beneficiary form for interbank transfers (phone search).
   */
  createEmptyInterbankBeneficiaryForm() {
    this.beneficiaryForm = this.formBuilder.group({
      phoneNumber: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(10)
        ]
      ],
      toBank: [''],
      toClientId: [''],
      toAccountType: [''],
      toAccountId: ['']
    });
  }

  /**
   * Populates the interbank beneficiary form after phone search resolves an account.
   */
  populateInterbankBeneficiary(account: any) {
    if (!account) {
      console.error('Account data is undefined');
      this.isLoading = false;
      return;
    }

    this.beneficiaryForm.patchValue({
      toBank: account.destinationFspId || '',
      toClientId: (account.firstName || account.firsName || '') + ' ' + (account.lastName || ''),
      toAccountType: 'Saving Account',
      toAccountId: account.partyId || ''
    });

    this.interbankTransferForm = true;
    this.isLoading = false;
  }

  /**
   * Creates the transfer details form (Step 2).
   */
  createTransferDetailsForm() {
    const defaultAmount =
      this.accountTransferTemplateData?.transferAmount > 0 ? this.accountTransferTemplateData.transferAmount : '';

    this.transferDetailsForm = this.formBuilder.group({
      transferDate: [
        this.settingsService.businessDate,
        Validators.required
      ],
      transferAmount: [
        defaultAmount,
        [
          Validators.required,
          Validators.min(0.01),
          this.amountExceedsBalanceValidator.bind(this)
        ]
      ],
      transferDescription: [
        '',
        Validators.required
      ]
    });
  }

  amountExceedsBalanceValidator(control: AbstractControl): ValidationErrors | null {
    const amount = control.value;
    return amount > this.balance ? { amountExceedsBalance: true } : null;
  }

  /** Sets options value */
  setOptions() {
    this.toOfficeTypeData = this.accountTransferTemplateData.toOfficeOptions;
    this.toAccountTypeData = this.accountTransferTemplateData.toAccountTypeOptions;
    this.toAccountData = this.accountTransferTemplateData.toAccountOptions;
  }

  /** Executes on change of various select options */
  changeEvent() {
    const formValue = this.refineObject({ ...this.beneficiaryForm.value });
    this.accountTransfersService
      .newAccountTranferResource(this.id, this.accountTypeId, formValue)
      .subscribe((response: any) => {
        this.accountTransferTemplateData = response;
        this.toClientTypeData = response.toClientOptions;
        this.setOptions();
      });
  }

  /** Refine Object
   * Removes the object param with null or '' values
   */
  refineObject(dataObj: any) {
    if (dataObj.toClientId && typeof dataObj.toClientId === 'object') {
      dataObj.toClientId = dataObj.toClientId.id;
    }
    const propNames = Object.getOwnPropertyNames(dataObj);
    for (let i = 0; i < propNames.length; i++) {
      const propName = propNames[i];
      if (dataObj[propName] === null || dataObj[propName] === undefined || dataObj[propName] === '') {
        delete dataObj[propName];
      }
    }
    return dataObj;
  }

  /**
   * Subscribes to Clients search filter:
   */
  ngAfterViewInit() {
    if (!this.interbank && this.beneficiaryForm) {
      this.beneficiaryForm.controls.toClientId.valueChanges.subscribe((value: any) => {
        if (typeof value === 'string' && value.length >= 2) {
          this.clientsService.getFilteredClients('displayName', 'ASC', true, value).subscribe((data: any) => {
            this.clientsData = data.pageItems;
          });
          this.changeEvent();
        }
      });
    }
  }

  /**
   * Displays Client name in form control input.
   * @param {any} client Client data.
   * @returns {string} Client name if valid otherwise undefined.
   */
  displayClient(client: any): string | undefined {
    return client ? client.displayName : undefined;
  }

  /** Helper methods for displaying selected beneficiary info in Step 2 summary */
  getSelectedOfficeName(): string {
    const officeId = this.beneficiaryForm?.get('toOfficeId')?.value;
    const office = this.toOfficeTypeData?.find((o: any) => o.id === officeId);
    return office ? office.name : '';
  }

  getSelectedClientName(): string {
    const client = this.beneficiaryForm?.get('toClientId')?.value;
    if (typeof client === 'object' && client) {
      return client.displayName;
    }
    return client || '';
  }

  getSelectedAccountTypeName(): string {
    const typeId = this.beneficiaryForm?.get('toAccountType')?.value;
    const type = this.toAccountTypeData?.find((t: any) => t.id === typeId);
    return type ? type.value : '';
  }

  getSelectedAccountName(): string {
    const accountId = this.beneficiaryForm?.get('toAccountId')?.value;
    const account = this.toAccountData?.find((a: any) => a.id === accountId);
    return account ? `${account.productName} - ${account.accountNo}` : '';
  }

  /**
   * Submits the transfer
   */
  submit() {
    this.interbank ? this.makeInterbankTransfer() : this.makeTransfer();
  }

  makeTransfer() {
    this.isLoading = true;
    const dateFormat = this.settingsService.dateFormat;
    const locale = this.settingsService.language.code;

    let toClientIdValue: any;
    if (typeof this.beneficiaryForm.controls.toClientId.value === 'object') {
      toClientIdValue = this.beneficiaryForm.controls.toClientId.value.id;
    } else {
      toClientIdValue = this.beneficiaryForm.controls.toClientId.value;
    }

    const makeAccountTransferData = {
      ...this.beneficiaryForm.value,
      ...this.transferDetailsForm.value,
      transferDate: this.dateUtils.formatDate(this.transferDetailsForm.value.transferDate, dateFormat),
      dateFormat,
      locale,
      toClientId: toClientIdValue,
      fromAccountId: this.id,
      fromAccountType: this.accountTypeId,
      fromClientId: this.accountTransferTemplateData.fromClient.id,
      fromOfficeId: this.accountTransferTemplateData.fromClient.officeId
    };

    this.accountTransfersService.createAccountTransfer(makeAccountTransferData).subscribe(
      (response: any) => {
        this.isLoading = false;
        this.transferComplete = true;
        this.transferSuccess = true;
        this.transferReferenceId = response?.resourceId || response?.transactionId || '';
        this.transferStepper.next();
      },
      (error: any) => {
        this.isLoading = false;
        this.transferComplete = true;
        this.transferSuccess = false;
        this.transferErrorMessage =
          error?.error?.defaultUserMessage || error?.message || 'An unexpected error occurred.';
        this.transferStepper.next();
      }
    );
  }

  makeInterbankTransfer() {
    this.isLoading = true;

    const payload = {
      homeTransactionId: crypto.randomUUID(),
      from: {
        fspId: environment.fineractPlatformTenantId,
        idType: 'MSISDN',
        idValue: this.accountTransferTemplateData.fromAccount.externalId?.trim() || ''
      },
      to: {
        fspId: this.beneficiaryForm.controls.toBank.value,
        idType: 'MSISDN',
        idValue: this.beneficiaryForm.controls.toAccountId.value
      },
      amountType: 'SEND',
      amount: {
        currencyCode: this.accountTransferTemplateData.currency.code,
        amount: this.transferDetailsForm.controls.transferAmount.value
      },
      transactionType: {
        scenario: 'TRANSFER',
        subScenario: 'DOMESTIC',
        initiator: 'PAYER',
        initiatorType: 'CUSTOMER'
      },
      note: this.transferDetailsForm.controls.transferDescription.value
    };

    this.accountTransfersService.sendInterbankTransfer(JSON.stringify(payload)).subscribe(
      (trnsfr) => {
        this.isLoading = false;
        this.transferComplete = true;
        this.transferSuccess = true;
        this.transferReferenceId = trnsfr?.systemMessage || '';
        this.transferStepper.next();
      },
      (error) => {
        console.error('Interbank transfer error:', error);
        this.isLoading = false;
        this.transferComplete = true;
        this.transferSuccess = false;
        this.transferErrorMessage =
          error?.error?.defaultUserMessage || error?.message || 'An unexpected error occurred.';
        this.transferStepper.next();
      }
    );
  }

  searchAccountByNumber() {
    const phoneNumber = this.beneficiaryForm.get('phoneNumber')?.value;
    if (!phoneNumber || phoneNumber.length !== 10) {
      return;
    }

    this.isLoading = true;
    this.accountTransfersService
      .getAccountByNumber(phoneNumber, this.accountTransferTemplateData.currency.code)
      .subscribe(
        (acc) => {
          this.populateInterbankBeneficiary(acc);
        },
        (error) => {
          console.error('searching account error:', error);
          this.isLoading = false;
        }
      );
  }
}
