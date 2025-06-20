/** Angular Imports */
import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

/** Custom Models */
import { FormfieldBase } from 'app/shared/form-dialog/formfield/model/formfield-base';
import { InputBase } from 'app/shared/form-dialog/formfield/model/input-base';
import { SelectBase } from 'app/shared/form-dialog/formfield/model/select-base';

/** Custom Dialogs */
import { TranslateService } from '@ngx-translate/core';
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';
import { FormDialogComponent } from 'app/shared/form-dialog/form-dialog.component';
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
import { MatStepperPrevious, MatStepperNext } from '@angular/material/stepper';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Client Address Step Component
 */
@Component({
  selector: 'mifosx-client-address-step',
  templateUrl: './client-address-step.component.html',
  styleUrls: ['./client-address-step.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent,
    MatAccordion,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
    MatExpansionPanelDescription,
    MatDivider,
    MatSlideToggle,
    MatStepperPrevious,
    MatStepperNext
  ]
})
export class ClientAddressStepComponent {
  /** Client Address Field Config */
  @Input() clientAddressFieldConfig: any;
  /** Client Template */
  @Input() clientTemplate: any;

  /** Client Address Data */
  clientAddressData: any[] = [];

  /**
   * @param {MatDialog} dialog Mat Dialog
   * @param {TranslateService} translateService Translate Service.
   */
  constructor(
    private dialog: MatDialog,
    private translateService: TranslateService
  ) {
    this.clientAddressData = [];
  }

  /**
   * Adds a client address
   */
  addAddress() {
    const data = {
      title:
        this.translateService.instant('labels.buttons.Add') +
        ' ' +
        this.translateService.instant('labels.catalogs.Client') +
        ' ' +
        this.translateService.instant('labels.heading.Address'),
      formfields: this.getAddressFormFields()
    };
    const addAddressDialogRef = this.dialog.open(FormDialogComponent, { data, width: '50rem' });
    addAddressDialogRef.afterClosed().subscribe((response: any) => {
      if (response.data) {
        const addressData = response.data.value;
        addressData.isActive = false;
        for (const key in addressData) {
          if (addressData[key] === '' || addressData[key] === undefined) {
            delete addressData[key];
          }
        }
        this.clientAddressData.push(addressData);
      }
    });
  }

  /**
   * Edit Address
   * @param {any} address Address
   * @param {number} index Address index
   */
  editAddress(address: any, index: number) {
    const data = {
      title:
        this.translateService.instant('labels.buttons.Edit') +
        ' ' +
        this.translateService.instant('labels.catalogs.Client') +
        ' ' +
        this.translateService.instant('labels.heading.Address'),
      formfields: this.getAddressFormFields(address),
      layout: { addButtonText: 'Edit' }
    };
    const editAddressDialogRef = this.dialog.open(FormDialogComponent, { data, width: '50rem' });
    editAddressDialogRef.afterClosed().subscribe((response: any) => {
      if (response.data) {
        const addressData = response.data.value;
        addressData.isActive = address.isActive;
        for (const key in addressData) {
          if (addressData[key] === '' || addressData[key] === undefined) {
            delete addressData[key];
          }
        }
        this.clientAddressData[index] = addressData;
      }
    });
  }

  /**
   * @param {any} address Client Address
   * @param {number} index Address index
   */
  deleteAddress(address: any, index: number) {
    const deleteAddressDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: {
        deleteContext: `${this.translateService.instant('labels.heading.Address')} ${this.translateService.instant('labels.inputs.Type')} : ${address.addressType} ${index}`
      }
    });
    deleteAddressDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.clientAddressData.splice(index, 1);
      }
    });
  }

  /**
   * Toggles address activity
   * @param {any} address Address
   */
  toggleAddress(address: any) {
    address.isActive = address.isActive ? false : true;
  }

  /**
   * Checks if field is enabled in address configuration
   * @param {any} address Address
   */
  isFieldEnabled(fieldName: any) {
    return this.clientAddressFieldConfig.find((fieldObj: any) => fieldObj.field === fieldName)?.isEnabled;
  }

  /**
   * Retrieves field Id from name.
   * Find pipe doesn't work with accordian.
   * @param {any} address Address
   */
  getSelectedValue(fieldName: any, fieldId: any) {
    return this.clientTemplate.address[0][fieldName].find((fieldObj: any) => fieldObj.id === fieldId);
  }

  /**
   * Gets formfields for form dialog.
   * @param {any} address Address
   */
  getAddressFormFields(address?: any) {
    let formfields: FormfieldBase[] = [];

    for (let index = 0; index < this.clientTemplate.address[0].addressTypeIdOptions.length; index++) {
      this.clientTemplate.address[0].addressTypeIdOptions[index].name = this.translateService.instant(
        `labels.catalogs.${this.clientTemplate.address[0].addressTypeIdOptions[index].name}`
      );
    }

    formfields.push(
      this.isFieldEnabled('addressType')
        ? new SelectBase({
            controlName: 'addressTypeId',
            label: this.translateService.instant('labels.inputs.Address Type'),
            value: address ? address.addressTypeId : '',
            options: { label: 'name', value: 'id', data: this.clientTemplate.address[0].addressTypeIdOptions },
            order: 1,
            required: true
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
            required: true,
            order: 2
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
            options: { label: 'name', value: 'id', data: this.clientTemplate.address[0].stateProvinceIdOptions },
            order: 8
          })
        : null
    );
    formfields.push(
      this.isFieldEnabled('countyDistrict')
        ? new InputBase({
            controlName: 'countryDistrict',
            label: this.translateService.instant('labels.inputs.Country District'),
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
            options: { label: 'name', value: 'id', data: this.clientTemplate.address[0].countryIdOptions },
            order: 10
          })
        : null
    );
    formfields.push(
      this.isFieldEnabled('postalCode')
        ? new InputBase({
            controlName: 'postalCode',
            label: this.translateService.instant('labels.inputs.Postal Code'),
            value: address ? address.postalCode : '',
            type: 'text',
            order: 11
          })
        : null
    );
    formfields = formfields.filter((field) => field !== null);
    return formfields;
  }

  /**
   * Returns the array of client addresses
   */
  get address() {
    return { address: this.clientAddressData ? this.clientAddressData : [] };
  }
}
