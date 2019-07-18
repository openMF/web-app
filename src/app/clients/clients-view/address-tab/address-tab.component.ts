import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material';
import { FormfieldBase } from 'app/shared/form-dialog/formfield/model/formfield-base';
import { InputBase } from 'app/shared/form-dialog/formfield/model/input-base';
import { SelectBase } from 'app/shared/form-dialog/formfield/model/select-base';

/** Custom Components */
import { FormDialogComponent } from 'app/shared/form-dialog/form-dialog.component';

/** Custom Services */
import { ClientsService } from '../../clients.service';

@Component({
  selector: 'mifosx-address-tab',
  templateUrl: './address-tab.component.html',
  styleUrls: ['./address-tab.component.scss']
})
export class AddressTabComponent implements OnInit {

  clientAddressData: any;
  clientAddressFieldConfig: any;
  clientAddressTemplate: any;
  clientId: string;

  constructor(private route: ActivatedRoute,
    private clientService: ClientsService,
    private dialog: MatDialog) {
    this.route.data.subscribe((data: {
      clientAddressData: any,
      clientAddressFieldConfig: any,
      clientAddressTemplateData: any
    }) => {
      this.clientAddressData = data.clientAddressData;
      this.clientAddressFieldConfig = data.clientAddressFieldConfig;
      this.clientAddressTemplate = data.clientAddressTemplateData;
      this.clientId = this.route.parent.snapshot.paramMap.get('clientId');
    });
  }

  ngOnInit() {
  }

  addAddress() {

    const data = {
      title: 'Add Client Address',
      formfields: this.getAddressFormFields('add')
    };
    const addAddressDialogRef = this.dialog.open(FormDialogComponent, { data });
    addAddressDialogRef.afterClosed().subscribe((response: any) => {
      if (response.data) {
        console.log(response.data);
        this.clientService.createClientAddress(this.clientId, response.data.value.addressType, response.data.value).subscribe((res: any) => {
          const addressData = response.data.value;
          addressData.addressId = res.resourceId;
          addressData.addressType = this.getSelectedValue('addressTypeIdOptions', addressData.addressType).name;
          addressData.isActive = false;
          this.clientAddressData.push(addressData);
        });

      }
    });
  }

  editAddress(address: any, index: number) {
    const data = {
      title: 'Edit Client Address',
      formfields: this.getAddressFormFields('edit', address),
      layout: { addButtonText: 'Edit' }
    };
    const editAddressDialogRef = this.dialog.open(FormDialogComponent, { data });
    editAddressDialogRef.afterClosed().subscribe((response: any) => {
      if (response.data) {
        console.log(response.data.value);
        const addressData = response.data.value;
        addressData.addressId = address.addressId;
        addressData.isActive = address.isActive;
        this.clientService.editClientAddress(this.clientId, address.addressTypeId, addressData).subscribe((res: any) => {
          addressData.addressTypeId = address.addressTypeId;
          addressData.addressType = address.addressType;
          this.clientAddressData[index] = addressData;
        });
      }
    });
  }

  toogleAddress(address: any) {
    const addressData = {
      'addressId': address.addressId,
      'isActive': address.isActive ? false : true
    };
    this.clientService.editClientAddress(this.clientId, address.addressTypeId, addressData).subscribe(() => {
      address.isActive = address.isActive ? false : true;
    });
  }

  isFieldEnabled(fieldName: any) {
    return (this.clientAddressFieldConfig.find((fieldObj: any) => fieldObj.field === fieldName)).is_enabled;
  }

  getSelectedValue(fieldName: any, fieldId: any) {
    return (this.clientAddressTemplate[fieldName].find((fieldObj: any) => fieldObj.id === fieldId));
  }

  getAddressFormFields(formType?: string, address?: any) {
    let formfields: FormfieldBase[] = [];
    if (formType === 'add') {
      formfields.push(this.isFieldEnabled('addressType') ? new SelectBase({
        controlName: 'addressType',
        label: 'Address Type',
        value: address ? address.addressType : '',
        options: { label: 'name', value: 'id', data: this.clientAddressTemplate.addressTypeIdOptions },
        order: 1
      }) : null);
    }
    formfields.push(this.isFieldEnabled('street') ? new InputBase({
      controlName: 'street',
      label: 'Street',
      value: address ? address.street : '',
      type: 'text',
      required: false,
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
      options: { label: 'name', value: 'id', data: this.clientAddressTemplate.stateProvinceIdOptions },
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
      options: { label: 'name', value: 'id', data: this.clientAddressTemplate.countryIdOptions },
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

}
