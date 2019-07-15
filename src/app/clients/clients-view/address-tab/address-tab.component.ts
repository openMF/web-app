import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'mifosx-address-tab',
  templateUrl: './address-tab.component.html',
  styleUrls: ['./address-tab.component.scss']
})
export class AddressTabComponent implements OnInit {

  clientAddressData: any;
  clientAddressFieldConfig: any;
  clientAddressTemplate: any;

  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe((data: {
      clientAddressData: any,
      clientAddressFieldConfig: any,
      clientAddressTemplateData: any
    }) => {
      this.clientAddressData = data.clientAddressData;
      this.clientAddressFieldConfig = data.clientAddressFieldConfig;
      this.clientAddressTemplate = data.clientAddressTemplateData;
    });
  }

  ngOnInit() {
  }

  isFieldEnabled(fieldName: any) {
    return (this.clientAddressFieldConfig.find((fieldObj: any) => fieldObj.field === fieldName)).is_enabled;
  }

  getSelectedValue(fieldName: any, fieldId: any) {
    return (this.clientAddressTemplate[fieldName].find((fieldObj: any) => fieldObj.id === fieldId));
  }

}
