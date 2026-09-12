/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';

/** Custom Services */
import { ClientsService } from 'app/clients/clients.service';
import { Dates } from 'app/core/utils/dates';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatAutocompleteTrigger, MatAutocomplete } from '@angular/material/autocomplete';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { LoanAccountActionsBaseComponent } from '../loan-account-actions-base.component';

/**
 * Fineract guarantor type ids, as served by `GET /loans/{loanId}/guarantors/template`.
 * `loan-guarantors-tab.component.html` already keys the edit action off `guarantorType.id === 3`,
 * so the id - not the position in `guarantorTypeOptions` - is the stable identifier.
 */
const EXISTING_CLIENT_GUARANTOR_TYPE_ID = 1;
const EXTERNAL_GUARANTOR_TYPE_ID = 3;

/** Controls that only apply when the guarantor is an existing client. */
const EXISTING_CLIENT_CONTROLS = [
  'name',
  'savingsId',
  'amount'
];

/** Controls that only apply when the guarantor is an external person. */
const EXTERNAL_GUARANTOR_CONTROLS = [
  'firstname',
  'lastname',
  'dob',
  'addressLine1',
  'addressLine2',
  'city',
  'zip',
  'mobileNumber',
  'housePhoneNumber'
];

/**
 * Create Guarantor Action
 */
@Component({
  selector: 'mifosx-create-guarantor',
  templateUrl: './create-guarantor.component.html',
  styleUrls: ['./create-guarantor.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatCheckbox,
    MatAutocompleteTrigger,
    MatAutocomplete
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateGuarantorComponent extends LoanAccountActionsBaseComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private formBuilder = inject(UntypedFormBuilder);
  private dateUtils = inject(Dates);
  private clientsService = inject(ClientsService);
  private cdr = inject(ChangeDetectorRef);

  /** New Guarantor Form */
  newGuarantorForm: UntypedFormGroup;
  /** Relation Types */
  relationTypes: any;
  /** Show Client Details Form */
  showClientDetailsForm = false;
  /** Minimum date allowed. */
  minDate = new Date(1900, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date();
  /** Client data. */
  clientsData: any = [];
  /** Account Options */
  accountOptions: any = [];

  constructor() {
    super();
  }

  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.createNewGuarantorForm();
    this.setNewGuarantorDetailsForm();
    this.buildDependencies();
    this.subscribeToClientSearch();
    this.subscribeToLinkedAccount();
  }

  /**
   * Creates the guarantor details form.
   *
   * Both variants of the form are built once and switched with enable()/disable() rather than
   * add/removeControl: a removed control also destroys the client-search subscription bound to
   * it, and `FormGroup.value` already omits disabled controls so the payload stays clean.
   */
  createNewGuarantorForm() {
    this.newGuarantorForm = this.formBuilder.group({
      existingClient: [true],
      clientRelationshipTypeId: [''],
      // Existing client
      name: [
        '',
        Validators.required
      ],
      savingsId: [''],
      amount: [''],
      // External guarantor
      firstname: [
        '',
        Validators.required
      ],
      lastname: [
        '',
        Validators.required
      ],
      dob: [''],
      addressLine1: [''],
      addressLine2: [''],
      city: [''],
      zip: [''],
      mobileNumber: [''],
      housePhoneNumber: ['']
    });
  }

  /** Sets Guarantor Details Form */
  setNewGuarantorDetailsForm() {
    this.relationTypes = this.dataObject.allowedClientRelationshipTypes;
    this.applyGuarantorMode(this.newGuarantorForm.value.existingClient);
  }

  /**
   * Switches the form between the existing client and the external guarantor variant.
   */
  private applyGuarantorMode(isExistingClient: boolean) {
    this.showClientDetailsForm = !isExistingClient;
    const enabled = isExistingClient ? EXISTING_CLIENT_CONTROLS : EXTERNAL_GUARANTOR_CONTROLS;
    const disabled = isExistingClient ? EXTERNAL_GUARANTOR_CONTROLS : EXISTING_CLIENT_CONTROLS;
    enabled.forEach((name) => this.newGuarantorForm.get(name).enable({ emitEvent: false }));
    disabled.forEach((name) => this.newGuarantorForm.get(name).disable({ emitEvent: false }));
  }

  /**
   * Add guarantor detail fields to the UI.
   */
  buildDependencies() {
    this.newGuarantorForm
      .get('existingClient')
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((isExistingClient: boolean) => {
        this.applyGuarantorMode(isExistingClient);
        // Drop the client selection and its linkable accounts, they belong to the other variant.
        this.newGuarantorForm.patchValue({ name: '', savingsId: '', amount: '' }, { emitEvent: false });
        this.clientsData = [];
        this.accountOptions = [];
        this.cdr.markForCheck();
      });
  }

  /**
   * Subscribes to Clients search filter.
   */
  private subscribeToClientSearch() {
    this.newGuarantorForm
      .get('name')
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value: any) => {
        // Once an option is picked the control holds the client object, not the search string.
        if (typeof value === 'string' && value.length >= 2) {
          this.clientsService.getFilteredClients('displayName', 'ASC', true, value).subscribe((data: any) => {
            this.clientsData = data.pageItems;
            this.cdr.markForCheck();
          });
        }
      });
  }

  /**
   * An amount is only meaningful once a savings account is linked, so it is required with a
   * linked account and cleared without one - otherwise picking a client who happens to have
   * savings accounts would block the plain "existing client guarantor" flow.
   */
  private subscribeToLinkedAccount() {
    this.newGuarantorForm
      .get('savingsId')
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((savingsId: any) => {
        const amount = this.newGuarantorForm.get('amount');
        if (savingsId) {
          amount.setValidators(Validators.required);
        } else {
          amount.clearValidators();
          amount.setValue('', { emitEvent: false });
        }
        amount.updateValueAndValidity({ emitEvent: false });
        this.cdr.markForCheck();
      });
  }

  clientSelected(clientDetails: any) {
    this.accountOptions = [];
    this.loanService.guarantorAccountResource(this.loanId, clientDetails.id).subscribe((response: any) => {
      this.accountOptions = response.accountLinkingOptions || [];
      this.cdr.markForCheck();
    });
  }

  /**
   * Displays Client name in form control input.
   * @param {any} client Client data.
   * @returns {string} Client name if valid otherwise undefined.
   */
  displayClient(client: any): string | undefined {
    return client ? client.displayName : undefined;
  }

  /** Submits the new guarantor details form */
  submit() {
    // Disabled controls are excluded, so this only holds the fields of the active variant.
    const newGuarantorFormData = this.newGuarantorForm.value;
    const isExistingClient: boolean = this.newGuarantorForm.get('existingClient').value;

    const data: any = {
      ...newGuarantorFormData,
      locale: this.settingsService.language.code,
      guarantorTypeId: isExistingClient ? EXISTING_CLIENT_GUARANTOR_TYPE_ID : EXTERNAL_GUARANTOR_TYPE_ID
    };

    if (isExistingClient) {
      data['entityId'] = this.newGuarantorForm.get('name').value?.id;
    } else {
      const dateFormat = this.settingsService.dateFormat;
      data['dateFormat'] = dateFormat;
      if (newGuarantorFormData.dob instanceof Date) {
        data['dob'] = this.dateUtils.formatDate(newGuarantorFormData.dob, dateFormat);
      }
    }

    delete data.existingClient;
    delete data.name;

    // Remove empty optional fields to avoid API validation errors
    Object.keys(data).forEach((key) => {
      if (data[key] === '' || data[key] === null || data[key] === undefined) {
        delete data[key];
      }
    });

    this.loanService.createNewGuarantor(this.loanId, data).subscribe(() => {
      this.gotoLoanView('guarantors');
    });
  }
}
