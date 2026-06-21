/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { FormfieldBase } from 'app/shared/form-dialog/formfield/model/formfield-base';
import { InputBase } from 'app/shared/form-dialog/formfield/model/input-base';
import { SelectBase } from 'app/shared/form-dialog/formfield/model/select-base';

/** Custom Components */
import { FormDialogComponent } from 'app/shared/form-dialog/form-dialog.component';

/** Custom Services */
import { TranslateService } from '@ngx-translate/core';
import { PostalCodeLookupService } from 'app/shared/services/postal-code-lookup.service';
import { ResolvedAddress } from 'app/shared/models/postal-code-lookup.model';

/** rxjs Imports */
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { of, Subscription } from 'rxjs';
import { ClientsService } from '../../clients.service';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  MatAccordion,
  MatExpansionPanel,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle,
  MatExpansionPanelDescription
} from '@angular/material/expansion';
import { MatDivider } from '@angular/material/divider';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Clients Address Tab Component
 */
@Component({
  selector: 'mifosx-address-tab',
  templateUrl: './address-tab.component.html',
  styleUrls: ['./address-tab.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent,
    MatAccordion,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
    MatExpansionPanelDescription,
    MatDivider,
    MatSlideToggle
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddressTabComponent {
  private route = inject(ActivatedRoute);
  private clientService = inject(ClientsService);
  private dialog = inject(MatDialog);
  private translateService = inject(TranslateService);
  private postalCodeLookup = inject(PostalCodeLookupService);
  private destroyRef = inject(DestroyRef);

  /** Client Address Data */
  clientAddressData: any;
  /** Client Address Field Config */
  clientAddressFieldConfig: any;
  /** Client Address Template */
  clientAddressTemplate: any;
  /** Client Id */
  clientId: string;

  /**
   * @param {ActivatedRoute} route Activated Route
   * @param {ClientsService} clientService Clients Service
   * @param {MatDialog} dialog Mat Dialog
   * @param {TranslateService} translateService Translate Service.
   */
  constructor() {
    this.route.data
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data: { clientAddressData: any; clientAddressFieldConfig: any; clientAddressTemplateData: any }) => {
        this.clientAddressData = data.clientAddressData;
        this.clientAddressFieldConfig = data.clientAddressFieldConfig;
        this.clientAddressTemplate = data.clientAddressTemplateData;
        this.clientId = this.route.parent.snapshot.paramMap.get('clientId');
      });
  }

  /**
   * Adds a client address.
   */
  addAddress() {
    const data = {
      title:
        this.translateService.instant('labels.buttons.Add') +
        ' ' +
        this.translateService.instant('labels.catalogs.Client') +
        ' ' +
        this.translateService.instant('labels.heading.Address'),
      formfields: this.getAddressFormFields('add')
    };
    const addAddressDialogRef = this.dialog.open(FormDialogComponent, { data });
    this.setupPostalCodeLookup(addAddressDialogRef);
    addAddressDialogRef.afterClosed().subscribe((response: any) => {
      if (response.data) {
        this.clientService
          .createClientAddress(this.clientId, response.data.value.addressType, response.data.value)
          .subscribe((res: any) => {
            const addressData = response.data.value;
            addressData.addressId = res.resourceId;
            addressData.addressType = this.getSelectedValue('addressTypeIdOptions', addressData.addressType).name;
            addressData.isActive = false;
            this.clientAddressData.push(addressData);
          });
      }
    });
  }

  /**
   * Edits an existing address.
   * @param {any} address Client address
   * @param {number} index address index
   */
  editAddress(address: any, index: number) {
    const data = {
      title:
        this.translateService.instant('labels.buttons.Edit') +
        ' ' +
        this.translateService.instant('labels.catalogs.Client') +
        ' ' +
        this.translateService.instant('labels.heading.Address'),
      formfields: this.getAddressFormFields('edit', address),
      layout: { addButtonText: 'Edit' }
    };
    const editAddressDialogRef = this.dialog.open(FormDialogComponent, { data });
    this.setupPostalCodeLookup(editAddressDialogRef);
    editAddressDialogRef.afterClosed().subscribe((response: any) => {
      if (response.data) {
        const addressData = response.data.value;
        addressData.addressId = address.addressId;
        addressData.isActive = address.isActive;
        this.clientService
          .editClientAddress(this.clientId, address.addressTypeId, addressData)
          .subscribe((res: any) => {
            addressData.addressTypeId = address.addressTypeId;
            addressData.addressType = address.addressType;
            this.clientAddressData[index] = addressData;
          });
      }
    });
  }

  /** Tracks which fields were auto-filled by the postal code lookup. */
  private autoFilledFields = new Set<string>();

  /**
   * Sets up postal code auto-lookup on the dialog form.
   * Subscribes to postalCode valueChanges, queries the lookup API,
   * and auto-fills City, State/Province, and Country fields.
   */
  private setupPostalCodeLookup(dialogRef: MatDialogRef<FormDialogComponent>) {
    if (!this.postalCodeLookup.enabled) return;

    let postalSub: Subscription;

    dialogRef.afterOpened().subscribe(() => {
      const form: FormGroup = dialogRef.componentInstance.form;
      const postalCodeControl = form.get('postalCode');
      if (!postalCodeControl) return;

      // Capture the initial country value so we can distinguish
      // user-selected countries from auto-filled ones.
      const initialCountryId = form.get('countryId')?.value || null;

      postalSub = postalCodeControl.valueChanges
        .pipe(
          debounceTime(600),
          distinctUntilChanged(),
          switchMap((value: string) => {
            if (!value || value.trim().length < 3) {
              return of(null);
            }
            const postalCode = value.trim();
            // Only use the country for lookup if the user explicitly selected it
            // (i.e. it was set initially or the user changed it manually).
            const currentCountryId = form.get('countryId')?.value;
            const isUserSelectedCountry =
              currentCountryId && (currentCountryId === initialCountryId || !this.autoFilledFields.has('countryId'));

            if (isUserSelectedCountry) {
              const countryCode = this.getSelectedCountryCode(form);
              if (countryCode) {
                return this.postalCodeLookup.lookup(countryCode, postalCode);
              }
            }
            return this.postalCodeLookup.lookupWithFallback(postalCode);
          })
        )
        .subscribe((response) => {
          if (!response) {
            this.clearAutoFilledFields(form);
            return;
          }
          const resolved = this.postalCodeLookup.toResolvedAddress(response);
          if (resolved) {
            this.clearAutoFilledFields(form);
            this.applyResolvedAddress(form, resolved);
          } else {
            this.clearAutoFilledFields(form);
          }
        });
    });

    dialogRef.afterClosed().subscribe(() => {
      postalSub?.unsubscribe();
      this.autoFilledFields.clear();
    });
  }

  /**
   * Gets the ISO country code for the currently selected country in the form.
   */
  private getSelectedCountryCode(form: FormGroup): string | null {
    const countryIdValue = form.get('countryId')?.value;
    if (!countryIdValue) return null;

    const selectedCountry = this.clientAddressTemplate.countryIdOptions?.find((c: any) => c.id === countryIdValue);
    if (!selectedCountry) return null;

    return this.postalCodeLookup.resolveCountryCode(selectedCountry.name);
  }

  /**
   * Applies the resolved address to the form fields.
   * Passes both full name and abbreviation to maximize match chances
   * against Fineract's configured code values.
   */
  /**
   * Clears form fields that were previously set by auto-fill,
   * so stale data doesn't persist when a new lookup fails or returns different results.
   */
  private clearAutoFilledFields(form: FormGroup) {
    for (const fieldName of this.autoFilledFields) {
      const control = form.get(fieldName);
      if (control) {
        control.setValue(fieldName === 'city' ? '' : '');
        control.markAsDirty();
      }
    }
    this.autoFilledFields.clear();
  }

  private applyResolvedAddress(form: FormGroup, address: ResolvedAddress) {
    const cityControl = form.get('city');
    if (cityControl && address.city) {
      cityControl.setValue(address.city);
      cityControl.markAsDirty();
      this.autoFilledFields.add('city');
    }

    const stateControl = form.get('stateProvinceId');
    if (stateControl && (address.state || address.stateAbbreviation)) {
      const stateOptions = this.clientAddressTemplate.stateProvinceIdOptions ?? [];
      const matched = this.postalCodeLookup.findBestMatch(stateOptions, address.state, address.stateAbbreviation);
      if (matched) {
        stateControl.setValue(matched.id);
        stateControl.markAsDirty();
        this.autoFilledFields.add('stateProvinceId');
      }
    }

    const countryControl = form.get('countryId');
    if (countryControl && (address.country || address.countryAbbreviation)) {
      const countryOptions = this.clientAddressTemplate.countryIdOptions ?? [];
      const matched = this.postalCodeLookup.findBestMatch(countryOptions, address.country, address.countryAbbreviation);
      if (matched) {
        countryControl.setValue(matched.id);
        countryControl.markAsDirty();
        this.autoFilledFields.add('countryId');
      }
    }

    form.markAsDirty();
  }

  /**
   * Toggles address activity.
   * @param {any} address Client Address
   */
  toggleAddress(address: any) {
    const addressData = {
      addressId: address.addressId,
      isActive: address.isActive ? false : true
    };
    this.clientService.editClientAddress(this.clientId, address.addressTypeId, addressData).subscribe(() => {
      address.isActive = address.isActive ? false : true;
    });
  }

  /**
   * Checks if field is enabled in address config.
   * @param {any} fieldName Field Name
   */
  isFieldEnabled(fieldName: any) {
    return this.clientAddressFieldConfig.find((fieldObj: any) => fieldObj.field === fieldName)?.isEnabled;
  }

  /**
   * Find Pipe doesn't work with accordian
   * @param {any} fieldName Field Name
   * @param {any} fieldId Field Id
   */
  getSelectedValue(fieldName: any, fieldId: any) {
    return this.clientAddressTemplate[fieldName].find((fieldObj: any) => fieldObj.id === fieldId);
  }

  /**
   * Returns address form fields for form dialog.
   * @param {string} formType Form Type
   * @param {any} address Address
   */
  getAddressFormFields(formType?: string, address?: any) {
    let formfields: FormfieldBase[] = [];

    for (let index = 0; index < this.clientAddressTemplate.addressTypeIdOptions.length; index++) {
      this.clientAddressTemplate.addressTypeIdOptions[index].name = this.translateService.instant(
        `labels.catalogs.${this.clientAddressTemplate.addressTypeIdOptions[index].name}`
      );
    }

    if (formType === 'add') {
      formfields.push(
        this.isFieldEnabled('addressType')
          ? new SelectBase({
              controlName: 'addressType',
              label: this.translateService.instant('labels.inputs.Address Type'),
              value: address ? address.addressType : '',
              options: { label: 'name', value: 'id', data: this.clientAddressTemplate.addressTypeIdOptions },
              order: 1
            })
          : null
      );
    }
    formfields.push(
      this.isFieldEnabled('postalCode')
        ? new InputBase({
            controlName: 'postalCode',
            label: this.translateService.instant('labels.inputs.Postal Code'),
            value: address ? address.postalCode : '',
            type: 'text',
            order: 2
          })
        : null
    );
    formfields.push(
      this.isFieldEnabled('street')
        ? new InputBase({
            controlName: 'street',
            label: this.translateService.instant('labels.inputs.Street'),
            value: address ? address.street : '',
            type: 'text',
            required: false,
            order: 3
          })
        : null
    );
    formfields.push(
      this.isFieldEnabled('addressLine1')
        ? new InputBase({
            controlName: 'addressLine1',
            label: this.translateService.instant('labels.inputs.Address Line') + ' 1',
            value: address ? address.addressLine1 : '',
            type: 'text',
            order: 3
          })
        : null
    );
    formfields.push(
      this.isFieldEnabled('addressLine2')
        ? new InputBase({
            controlName: 'addressLine2',
            label: this.translateService.instant('labels.inputs.Address Line') + ' 2',
            value: address ? address.addressLine2 : '',
            type: 'text',
            order: 4
          })
        : null
    );
    formfields.push(
      this.isFieldEnabled('addressLine3')
        ? new InputBase({
            controlName: 'addressLine3',
            label: this.translateService.instant('labels.inputs.Address Line') + ' 3',
            value: address ? address.addressLine3 : '',
            type: 'text',
            order: 5
          })
        : null
    );
    formfields.push(
      this.isFieldEnabled('townVillage')
        ? new InputBase({
            controlName: 'townVillage',
            label: this.translateService.instant('labels.inputs.Town / Village'),
            value: address ? address.townVillage : '',
            type: 'text',
            order: 6
          })
        : null
    );
    formfields.push(
      this.isFieldEnabled('city')
        ? new InputBase({
            controlName: 'city',
            label: this.translateService.instant('labels.inputs.City'),
            value: address ? address.city : '',
            type: 'text',
            order: 7
          })
        : null
    );
    formfields.push(
      this.isFieldEnabled('stateProvinceId')
        ? new SelectBase({
            controlName: 'stateProvinceId',
            label: this.translateService.instant('labels.inputs.State / Province'),
            value: address ? address.stateProvinceId : '',
            options: { label: 'name', value: 'id', data: this.clientAddressTemplate.stateProvinceIdOptions },
            order: 8
          })
        : null
    );
    formfields.push(
      this.isFieldEnabled('countyDistrict')
        ? new InputBase({
            controlName: 'countryDistrict',
            label: this.translateService.instant('labels.inputs.State / Province'),
            value: address ? address.countyDistrict : '',
            type: 'text',
            order: 11
          })
        : null
    );
    formfields.push(
      this.isFieldEnabled('countryId')
        ? new SelectBase({
            controlName: 'countryId',
            label: this.translateService.instant('labels.inputs.Country'),
            value: address ? address.countryId : '',
            options: { label: 'name', value: 'id', data: this.clientAddressTemplate.countryIdOptions },
            order: 10
          })
        : null
    );
    formfields = formfields.filter((field) => field !== null);
    return formfields;
  }
}
