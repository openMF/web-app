/** Angular Imports */
import { Component, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

/** Custom Services */
import { ClientsService } from '../clients.service';

/** Custom Components */
import { ClientGeneralStepComponent } from '../client-stepper/client-general-step/client-general-step.component';
import { ClientFamilyMembersStepComponent } from '../client-stepper/client-family-members-step/client-family-members-step.component';
import { ClientAddressStepComponent } from '../client-stepper/client-address-step/client-address-step.component';
import { ClientDatatableStepComponent } from '../client-stepper/client-datatable-step/client-datatable-step.component';

/** Custom Services */
import { SettingsService } from 'app/settings/settings.service';

/**
 * Create Client Component.
 */
@Component({
  selector: 'mifosx-create-client',
  templateUrl: './create-client.component.html',
  styleUrls: ['./create-client.component.scss']
})
export class CreateClientComponent {

  /** Client General Step */
  @ViewChild(ClientGeneralStepComponent, { static: true }) clientGeneralStep: ClientGeneralStepComponent;
  /** Client Family Members Step */
  @ViewChild('clientFamily') clientFamilyMembersStep: ClientFamilyMembersStepComponent;
  /** Client Address Step */
  @ViewChild('clientAddress') clientAddressStep: ClientAddressStepComponent;
  /** Get handle on dtclient tags in the template */
  @ViewChildren('dtclient') clientDatatables: QueryList<ClientDatatableStepComponent>;

  datatables: any = [];
  legalFormType = 1;

  /** Client Template */
  clientTemplate: any;
  /** Client Address Field Config */
  clientAddressFieldConfig: any;

  /**
   * Fetches client and address template from `resolve`
   * @param {ActivatedRoute} route Activated Route
   * @param {Router} router Router
   * @param {ClientsService} clientsService Clients Service
   * @param {SettingsService} settingsService Setting service
   */
  constructor(private route: ActivatedRoute,
    private router: Router,
    private clientsService: ClientsService,
    private settingsService: SettingsService) {
    this.route.data.subscribe((data: { clientTemplate: any, clientAddressFieldConfig: any }) => {
      this.clientTemplate = data.clientTemplate;
      this.clientAddressFieldConfig = data.clientAddressFieldConfig;
      this.setDatatables();
    });
  }

  /**
   * Retrieves general information about client.
   */
  get clientGeneralForm() {
    return this.clientGeneralStep.createClientForm;
  }

  /**
   * Retrieves the client object
   */
  get client() {
    if (this.clientTemplate.isAddressEnabled) {
      return {
        ...this.clientGeneralStep.clientGeneralDetails,
        ...this.clientFamilyMembersStep.familyMembers,
        ...this.clientAddressStep.address
      };
    } else {
      return {
        ...this.clientGeneralStep.clientGeneralDetails,
        ...this.clientFamilyMembersStep.familyMembers
      };
    }
  }

  areFormvalids(): boolean {
    let areValids = this.clientGeneralForm.valid;
    if (this.clientTemplate.isAddressEnabled) {
      areValids = areValids && (this.clientAddressStep.address.address.length > 0);
    }
    if (this.clientTemplate.datatables && this.clientTemplate.datatables.length > 0 && this.clientDatatables) {
      this.clientDatatables.forEach((clientDatatable: ClientDatatableStepComponent) => {
        areValids = areValids && clientDatatable.datatableForm.valid;
      });
    }

    return areValids;
  }

  setDatatables(): void {
    this.datatables = [];
    let legalFormTypeVal = 'person';
    if (this.legalFormType === 2) {
      legalFormTypeVal = 'entity';
    }
    if (this.clientTemplate.datatables) {
      this.clientTemplate.datatables.forEach((datatable: any) => {
        if (datatable.entitySubType.toLowerCase() === legalFormTypeVal) {
          this.datatables.push(datatable);
        }
      });
    }
  }

  legalFormChange(eventData: { legalForm: number }) {
    this.legalFormType = eventData.legalForm;
    this.setDatatables();
  }

  /**
   * Submits the create client form.
   */
  submit() {
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const clientData = {
      ...this.client,
      dateFormat,
      locale
    };

    if (this.clientTemplate.datatables && this.clientTemplate.datatables.length > 0) {
      const datatables: any[] = [];
      this.clientDatatables.forEach((clientDatatable: ClientDatatableStepComponent) => {
        datatables.push(clientDatatable.payload);
      });
      clientData['datatables'] = datatables;
    }

    this.clientsService.createClient(clientData).subscribe((response: any) => {
      this.router.navigate(['../', response.resourceId], { relativeTo: this.route });
    });
  }

}
