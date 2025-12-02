/** Angular Imports */
import { Component, OnInit, AfterViewInit } from '@angular/core';
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
import { MatFormField, MatLabel, MatHint, MatError } from '@angular/material/form-field';
import { MatAutocompleteTrigger, MatAutocomplete } from '@angular/material/autocomplete';
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
    FaIconComponent,
    CdkTextareaAutosize
  ]
})
export class MakeAccountTransfersComponent implements OnInit, AfterViewInit {
  /** Standing Instructions Data */
  accountTransferTemplateData: any;
  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date(2100, 0, 1);
  /** Edit Standing Instructions form. */
  makeAccountTransferForm: UntypedFormGroup;
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
  /** Reference of phoneAccount search */
  phoneAccount = '';
  /** Interbank transfer form flag */
  interbankTransferForm: boolean = false;
  balance: number = 0;
  isLoading: boolean = false;

  /**
   * Retrieves the standing instructions template from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   * @param {FormBuilder} formBuilder Form Builder
   * @param {Router} router Router
   * @param {AccountTransfersService} accountTransfersService Account Transfers Service
   * @param {Dates} dateUtils Date Utils
   * @param {SettingsService} settingsService Settings Service
   * @param {ClientsService} clientsService Clients Service
   */
  constructor(
    private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountTransfersService: AccountTransfersService,
    private dateUtils: Dates,
    private settingsService: SettingsService,
    private clientsService: ClientsService
  ) {
    this.route.data.subscribe((data: { accountTransferTemplate: any }) => {
      this.accountTransferTemplateData = data.accountTransferTemplate;
      this.setParams();
      this.setOptions();
    });
  }

  /** Sets the value from the URL */
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
        const navigationBalance = this.router.getCurrentNavigation()?.extras?.state?.balance;
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
   * Creates and sets the create standing instructions form.
   */
  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    if (!this.interbank) {
      this.createMakeAccountTransferForm();
    } else {
      this.createEmptyInterbankForm();
    }
  }

  /**
   * Crea un formulario vacío para interbank mientras se carga
   */
  createEmptyInterbankForm() {
    this.makeAccountTransferForm = this.formBuilder.group({
      toBank: [
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
      ],
      transferAmount: [
        0,
        [
          Validators.required,
          Validators.min(0.01),
          this.amountExceedsBalanceValidator.bind(this)]
      ],
      transferDate: [
        this.settingsService.businessDate,
        Validators.required
      ],
      transferDescription: [
        '',
        Validators.required
      ]
    });
  }

  /**
   * Creates the standing instruction form.
   */
  createMakeAccountTransferForm() {
    this.makeAccountTransferForm = this.formBuilder.group({
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
      ],
      transferAmount: [
        this.accountTransferTemplateData.transferAmount,
        [
          Validators.required,
          Validators.min(0.01),
          this.amountExceedsBalanceValidator.bind(this)]
      ],
      transferDate: [
        this.settingsService.businessDate,
        Validators.required
      ],
      transferDescription: [
        '',
        Validators.required
      ]
    });
  }

  createMakeAccountInterbankTransferForm(account: any) {
    if (!account) {
      console.error('Account data is undefined');
      this.isLoading = false;
      return;
    }

    const defaultAmount =
      this.accountTransferTemplateData?.transferAmount > 0 ? this.accountTransferTemplateData.transferAmount : 1;

    this.makeAccountTransferForm = this.formBuilder.group({
      toBank: [
        account.destinationFspId || '',
        Validators.required
      ],
      toClientId: [
        (account.firstName || account.firsName || '') + ' ' + (account.lastName || ''),
        Validators.required
      ],
      toAccountType: [
        'Saving Account',
        Validators.required
      ],
      toAccountId: [
        account.partyId || '',
        Validators.required
      ],
      transferAmount: [
        defaultAmount,
        [
          Validators.required,
          Validators.min(0.01),
          this.amountExceedsBalanceValidator.bind(this)]
      ],
      transferDate: [
        this.settingsService.businessDate,
        Validators.required
      ],
      transferDescription: [
        'Transferencia interbancaria',
        Validators.required
      ]
    });
    this.isLoading = false;
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
    const formValue = this.refineObject(this.makeAccountTransferForm.value);
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
  refineObject(dataObj: { [x: string]: any; transferAmount: any; transferDate: any; transferDescription: any }) {
    delete dataObj.transferAmount;
    delete dataObj.transferDate;
    delete dataObj.transferDescription;
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
    if (!this.interbank && this.makeAccountTransferForm) {
      this.makeAccountTransferForm.controls.toClientId.valueChanges.subscribe((value: any) => {
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

  /**
   * Submits the standing instructions form
   */
  submit() {
    this.interbank ? this.makeInterbankTransfer() : this.makeTransfer();
  }

  makeTransfer() {
    this.isLoading = true;
    const dateFormat = this.settingsService.dateFormat;
    const locale = this.settingsService.language.code;

    let toClientIdValue: any;
    if (typeof this.makeAccountTransferForm.controls.toClientId.value === 'object') {
      toClientIdValue = this.makeAccountTransferForm.controls.toClientId.value.id;
    } else {
      toClientIdValue = this.makeAccountTransferForm.controls.toClientId.value;
    }

    const makeAccountTransferData = {
      ...this.makeAccountTransferForm.value,
      transferDate: this.dateUtils.formatDate(this.makeAccountTransferForm.value.transferDate, dateFormat),
      dateFormat,
      locale,
      toClientId: toClientIdValue,
      fromAccountId: this.id,
      fromAccountType: this.accountTypeId,
      fromClientId: this.accountTransferTemplateData.fromClient.id,
      fromOfficeId: this.accountTransferTemplateData.fromClient.officeId
    };

    this.accountTransfersService.createAccountTransfer(makeAccountTransferData).subscribe(() => {
      this.isLoading = false;
      this.router.navigate(['../../transactions'], { relativeTo: this.route });
    });
  }

  makeInterbankTransfer() {
    this.isLoading = true;

    if (!this.makeAccountTransferForm.valid) {
      console.error('Interbank form is not valid');
      this.isLoading = false;
      return;
    }

    const payload = {
      homeTransactionId: crypto.randomUUID(),
      from: {
        fspId: environment.fineractPlatformTenantId,
        idType: 'MSISDN',
        idValue: this.accountTransferTemplateData.fromAccount.externalId?.trim() || ''
      },
      to: {
        fspId: this.makeAccountTransferForm.controls.toBank.value,
        idType: 'MSISDN',
        idValue: this.makeAccountTransferForm.controls.toAccountId.value
      },
      amountType: 'SEND',
      amount: {
        currencyCode: this.accountTransferTemplateData.currency.code,
        amount: this.makeAccountTransferForm.controls.transferAmount.value
      },
      transactionType: {
        scenario: 'TRANSFER',
        subScenario: 'DOMESTIC',
        initiator: 'PAYER',
        initiatorType: 'CUSTOMER'
      },
      note: this.makeAccountTransferForm.controls.transferDescription.value
    };

    this.accountTransfersService.sendInterbankTransfer(JSON.stringify(payload)).subscribe(
      (trnsfr) => {
        if (trnsfr.systemMessage) {
          this.isLoading = false;
          this.router.navigate(['../../transactions'], { relativeTo: this.route });
        }
      },
      (error) => {
        console.error('Interbank transfer error:', error);
        this.isLoading = false;
      }
    );
  }

  searchAccountByNumber() {
    if (!this.phoneAccount || this.phoneAccount.length !== 10) {
      return;
    }

    this.isLoading = true;
    this.accountTransfersService
      .getAccountByNumber(this.phoneAccount, this.accountTransferTemplateData.currency.code)
      .subscribe(
        (acc) => {
          this.interbankTransferForm = true;
          this.createMakeAccountInterbankTransferForm(acc);
        },
        (error) => {
          console.error('searching account error:', error);
          this.isLoading = false;
        }
      );
  }
}
