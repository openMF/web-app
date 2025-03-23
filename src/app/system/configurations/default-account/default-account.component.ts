import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

import { Alert } from 'app/core/alert/alert.model';
import { AlertService } from 'app/core/alert/alert.service';
import { SettingsService } from 'app/settings/settings.service';
import { Subscription } from 'rxjs';
import { ClientsService } from 'app/clients/clients.service';

/** Custom Services */
import { SystemService } from '../../system.service';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'mifosx-default-account',
  templateUrl: './default-account.component.html',
  styleUrls: ['./default-account.component.scss']
})
export class DefaultAccountComponent implements OnInit {

  /** Subscription to alerts. */
  alert$: Subscription;
  isDefaultAccountEnabled = false;

  selectedClientId: number | null = null;
  selectedClientName: string = '';
  selectedAccountId: number | null = null;
  clientsData: any[] = [];
  toAccountData: any[] = [];

  /** Global Configuration form. */
  configurationForm: UntypedFormGroup;

  /** Configuration. */
  configuration: any;
  /**
 * Retrieves the configurations data from `resolve`.
 * @param {SystemService} systemService System Service.
 * @param {SettingsService} settingsService Settings Service.
 * @param {FormBuilder} formBuilder Form Builder.
 * @param {Dates} dateUtils Date Utils.
 */
  constructor(
    private systemService: SystemService,
    private settingsService: SettingsService,
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private alertService: AlertService,
    private clientsService: ClientsService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.alert$ = this.alertService.alertEvent.subscribe((alertEvent: Alert) => {
      const alertType = alertEvent.type;
      if (alertType === SettingsService.defaultAccountType + ' Set Config') {
        this.isDefaultAccountEnabled = alertEvent.message === 'enabled' ? true : false;
      }
    });
    this.getConfigurations();
  }



  /**
* Get the Configuration and the Business Date data
*/
  getConfigurations(): void {
    this.systemService
      .getConfigurationByName(SettingsService.defaultAccountConfigName)
      .subscribe((configurationData: any) => {
        this.isDefaultAccountEnabled = configurationData.enabled;
        this.configuration = configurationData;
        this.createConfigurationForm();
      });
  }


  searchClients(name: string) {
    if (name.length >= 4) {
      this.clientsService.getFilteredClients('displayName', 'asc', false, name)
        .subscribe(data => {
          this.clientsData = data.pageItems;
        });
    } else {
      this.clientsData = [];
    }
  }

  onClientSelected(event: MatAutocompleteSelectedEvent) {
    const selectedClient = this.clientsData.find(client => client.displayName === event.option.value);
    if (selectedClient) {
      this.selectedClientId = selectedClient.id;
      this.loadAccounts(selectedClient.id);
    }
  }

  loadAccounts(clientId: string) {
    this.clientsService.getClientAccountData(clientId).subscribe((data: any) => {
      this.toAccountData = data.savingsAccounts ?? [];
      this.selectedAccountId = null;
    });
  }



  /**
 * Creates and sets the global configuration form.
 */
  createConfigurationForm() {
    this.configurationForm = this.formBuilder.group({
      name: [
        { value: this.configuration.name, disabled: true },
        Validators.required
      ],
      description: [{ value: this.configuration.description, disabled: true }],
      value: [this.configuration.value],
      stringValue: [this.configuration.stringValue],
      dateValue: [this.configuration.dateValue]
    });
  }

  /**
   * Send changes to back
   */
  submit() {
    console.log(this.configuration);
    if (
      this.selectedAccountId != null ||
      this.configurationForm.value.stringValue != null ||
      this.configurationForm.value.dateValue != null
    ) {
      this.configurationForm.value.value = this.selectedAccountId;
      const payload = {
        ...this.configurationForm.value
      };
      if (!this.configurationForm.value.stringValue) {
        delete payload.stringValue;
      }
      if (this.configurationForm.value.dateValue != null) {
        payload.locale = this.settingsService.language.code;
        payload.dateFormat = this.settingsService.dateFormat;
      } else {
        delete payload.dateValue;
      }

      this.systemService.updateConfiguration(this.configuration.id, payload).subscribe((response: any) => {
        this.router.navigate(['../'], { relativeTo: this.route });
      });
    }
  }

}
