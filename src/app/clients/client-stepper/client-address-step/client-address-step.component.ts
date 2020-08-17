/** Angular Imports */
import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

/** Custom Models */
import { FormfieldBase } from 'app/shared/form-dialog/formfield/model/formfield-base';
import { InputBase } from 'app/shared/form-dialog/formfield/model/input-base';
import { SelectBase } from 'app/shared/form-dialog/formfield/model/select-base';

/** Custom Dialogs */
import { FormDialogComponent } from 'app/shared/form-dialog/form-dialog.component';
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';

/**
 * Client Address Step Component
 */
@Component({
  selector: 'mifosx-client-address-step',
  templateUrl: './client-address-step.component.html',
  styleUrls: ['./client-address-step.component.scss']
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
   */
  constructor(private dialog: MatDialog) { }

  /**
   * Adds a client address
   */
  addAddress() {
    const data = {
      title: 'Add Client Address',
      formfields: this.getAddressFormFields()
    };
    const addAddressDialogRef = this.dialog.open(FormDialogComponent, { data });
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
      title: 'Edit Client Address',
      formfields: this.getAddressFormFields(address),
      layout: { addButtonText: 'Edit' }
    };
    const editAddressDialogRef = this.dialog.open(FormDialogComponent, { data });
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
      data: { deleteContext: `address type : ${address.addressType} ${index}` }
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
    return (this.clientAddressFieldConfig.find((fieldObj: any) => fieldObj.field === fieldName)).is_enabled;
  }

  /**
   * Retrieves field Id from name.
   * Find pipe doesn't work with accordian.
   * @param {any} address Address
   */
  getSelectedValue(fieldName: any, fieldId: any) {
    return (this.clientTemplate.address[fieldName].find((fieldObj: any) => fieldObj.id === fieldId));
  }

  /**
   * Gets formfields for form dialog.
   * @param {any} address Address
   */
  getAddressFormFields(address?: any) {
    let formfields: FormfieldBase[] = [];
    formfields.push(this.isFieldEnabled('addressType') ? new SelectBase({
      controlName: 'addressTypeId',
      label: 'Address Type',
      value: address ? address.addressTypeId : '',
      options: { label: 'name', value: 'id', data: this.clientTemplate.address.addressTypeIdOptions },
      order: 1,
      required: true
    }) : null);
    formfields.push(this.isFieldEnabled('street') ? new InputBase({
      controlName: 'street',
      label: 'Street',
      value: address ? address.street : '',
      type: 'text',
      required: true,
      order: 2
    }) : null);
    formfields.push(this.isFieldEnabled('addressLine1') ? new InputBase({
      controlName: 'addressLine1',
      label: 'Address Line 1',
      value: address ? address.addressLine1 : '',
      type: 'text',
      order: 3
    }) : null);
    formfields.push(this.isFieldEnabled('addressLine2') ? new InputBase({
      controlName: 'addressLine2',
      label: 'Address Line 2',
      value: address ? address.addressLine2 : '',
      type: 'text',
      order: 4
    }) : null);
    formfields.push(this.isFieldEnabled('addressLine3') ? new InputBase({
      controlName: 'addressLine3',
      label: 'Address Line 3',
      value: address ? address.addressLine3 : '',
      type: 'text',
      order: 5
    }) : null);
    formfields.push(this.isFieldEnabled('townVillage') ? new InputBase({
      controlName: 'townVillage',
      label: 'Town / Village',
      value: address ? address.townVillage : '',
      type: 'text',
      order: 6
    }) : null);
    formfields.push(this.isFieldEnabled('city') ? new InputBase({
      controlName: 'city',
      label: 'City',
      value: address ? address.city : '',
      type: 'text',
      order: 7
    }) : null);
    formfields.push(this.isFieldEnabled('stateProvinceId') ? new SelectBase({
      controlName: 'stateProvinceId',
      label: 'State / Province',
      value: address ? address.stateProvinceId : '',
      options: { label: 'name', value: 'id', data: this.clientTemplate.address.stateProvinceIdOptions },
      order: 8
    }) : null);
    formfields.push(this.isFieldEnabled('countyDistrict') ? new InputBase({
      controlName: 'countryDistrict',
      label: 'Country District',
      value: address ? address.countyDistrict : '',
      type: 'text',
      order: 11
    }) : null);
    formfields.push(this.isFieldEnabled('countryId') ? new SelectBase({
      controlName: 'countryId',
      label: 'Country',
      value: address ? address.countryId : '',
      options: { label: 'name', value: 'id', data: this.clientTemplate.address.countryIdOptions },
      order: 10
    }) : null);
    formfields.push(this.isFieldEnabled('postalCode') ? new InputBase({
      controlName: 'postalCode',
      label: 'Postal Code',
      value: address ? address.postalCode : '',
      type: 'text',
      order: 11
    }) : null);
    formfields = formfields.filter(field => field !== null);
    return formfields;
  }

  /**
   * Returns the array of client addresses
   */
  get address() {
    return { address: this.clientAddressData };
  }

}
