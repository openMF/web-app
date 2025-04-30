import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ClientsService } from 'app/clients/clients.service';
import { OrganizationService } from 'app/organization/organization.service';
import { FormDialogComponent } from 'app/shared/form-dialog/form-dialog.component';
import { FormfieldBase } from 'app/shared/form-dialog/formfield/model/formfield-base';
import { InputBase } from 'app/shared/form-dialog/formfield/model/input-base';
import { SelectBase } from 'app/shared/form-dialog/formfield/model/select-base';

@Component({
  selector: 'mifosx-investment-project-general-tab',
  templateUrl: './investment-project-general-tab.component.html',
  styleUrls: ['./investment-project-general-tab.component.scss']
})
export class InvestmentProjectGeneralTabComponent implements OnInit {
  projectData: any;
  addressTemplate: any;
  addressData: any;
  idProject: any;

  constructor(
    private route: ActivatedRoute,
    private organizationService: OrganizationService,
    private dialog: MatDialog,
    private translateService: TranslateService,
    private clientService: ClientsService
  ) {
    this.route.data.subscribe((data: { accountData: any }) => {
      this.projectData = data.accountData;
    });
  }

  ngOnInit(): void {
    this.idProject = this.route.parent?.snapshot.paramMap.get('id');
    this.getAddressTemplate();
    this.getAddressData();
  }

  getAddressTemplate() {
    this.clientService.getClientAddressTemplate().subscribe({
      next: (response: any) => {
        if (response) {
          this.addressTemplate = response;
        }
      },
      error: (error) => {
        console.error('Error loading address template:', error);
      }
    });
  }

  getAddressData() {
    this.organizationService.getAddresDataByProjectId(this.idProject).subscribe({
      next: (response: any) => {
        if (response) {
          this.addressData = response;
        }
      },
      error: (error) => {
        console.error('Error loading address data:', error);
      }
    });
  }

  addAddress() {
    const data = {
      formfields: this.getAddressFormFields('add', this.addressData)
    };

    const addAddressDialogRef = this.dialog.open(FormDialogComponent, { data });

    addAddressDialogRef.afterClosed().subscribe((response: any) => {
      if (response?.data) {
        const dataToSend = {
          ...response.data.value,
          latitude: response.data.value.latitude,
          longitude: response.data.value.longitude
        };

        this.organizationService.addOrUpdateAddress(dataToSend, this.idProject).subscribe((res: any) => {
          if (res) {
            window.location.reload();
          }
        });
      }
    });
  }

  getAddressFormFields(formType?: string, address?: any) {
    let formfields: FormfieldBase[] = [];

    const normalizedAddress = address
      ? {
          ...address,
          stateProvinceId: address.stateProvince?.id,
          countryId: address.country?.id
        }
      : null;

    for (let index = 0; index < this.addressTemplate.addressTypeIdOptions.length; index++) {
      this.addressTemplate.addressTypeIdOptions[index].name = this.translateService.instant(
        `labels.catalogs.${this.addressTemplate.addressTypeIdOptions[index].name}`
      );
    }

    formfields.push(
      new InputBase({
        controlName: 'addressLine1',
        label: this.translateService.instant('labels.inputs.Address Line') + ' 1',
        value: normalizedAddress ? normalizedAddress?.addressLine1 : '',
        type: 'text',
        order: 1
      })
    );

    formfields.push(
      new InputBase({
        controlName: 'addressLine2',
        label: this.translateService.instant('labels.inputs.Address Line') + ' 2',
        value: normalizedAddress ? normalizedAddress?.addressLine2 : '',
        type: 'text',
        order: 2
      })
    );

    formfields.push(
      new InputBase({
        controlName: 'addressLine3',
        label: this.translateService.instant('labels.inputs.Address Line') + ' 3',
        value: normalizedAddress ? normalizedAddress?.addressLine3 : '',
        type: 'text',
        order: 3
      })
    );

    formfields.push(
      new InputBase({
        controlName: 'townVillage',
        label: this.translateService.instant('labels.inputs.Town / Village'),
        value: normalizedAddress ? normalizedAddress?.townVillage : '',
        type: 'text',
        order: 4
      })
    );

    formfields.push(
      new SelectBase({
        controlName: 'countryId',
        label: this.translateService.instant('labels.inputs.Country'),
        value: normalizedAddress ? normalizedAddress?.countryId : '',
        options: { label: 'name', value: 'id', data: this.addressTemplate?.countryIdOptions },
        order: 5
      })
    );

    formfields.push(
      new SelectBase({
        controlName: 'stateProvinceId',
        label: this.translateService.instant('labels.inputs.State / Province'),
        value: normalizedAddress ? normalizedAddress?.stateProvinceId : '',
        options: { label: 'name', value: 'id', data: this.addressTemplate?.stateProvinceIdOptions },
        order: 6
      })
    );

    formfields.push(
      new InputBase({
        controlName: 'city',
        label: this.translateService.instant('labels.inputs.City'),
        value: normalizedAddress ? normalizedAddress?.city : '',
        type: 'text',
        order: 7
      })
    );

    formfields.push(
      new InputBase({
        controlName: 'postalCode',
        label: this.translateService.instant('labels.inputs.Postal Code'),
        value: normalizedAddress ? normalizedAddress?.postalCode : '',
        type: 'text',
        order: 8
      })
    );

    formfields.push(
      new InputBase({
        controlName: 'latitude',
        label: 'Latitude',
        value: normalizedAddress ? normalizedAddress?.latitude : '',
        type: 'text',
        required: false,
        order: 9
      })
    );

    formfields.push(
      new InputBase({
        controlName: 'longitude',
        label: 'Longitude',
        value: normalizedAddress ? normalizedAddress?.longitude : '',
        type: 'text',
        required: false,
        order: 10
      })
    );

    formfields = formfields.filter((field) => field !== null);
    return formfields;
  }
}
