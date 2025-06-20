import { Component, OnInit } from '@angular/core';
import { Alert } from 'app/core/alert/alert.model';
import { AlertService } from 'app/core/alert/alert.service';
import { SettingsService } from 'app/settings/settings.service';
import { Subscription } from 'rxjs';
import { SystemService } from '../system.service';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { GlobalConfigurationsTabComponent } from './global-configurations-tab/global-configurations-tab.component';
import { BusinessDateTabComponent } from './business-date-tab/business-date-tab.component';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-configurations',
  templateUrl: './configurations.component.html',
  styleUrls: ['./configurations.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatTabGroup,
    MatTab,
    GlobalConfigurationsTabComponent,
    BusinessDateTabComponent
  ]
})
export class ConfigurationsComponent implements OnInit {
  /** Subscription to alerts. */
  alert$: Subscription;

  isBusinessDateEnabled = false;

  constructor(
    private alertService: AlertService,
    private systemService: SystemService
  ) {}

  ngOnInit(): void {
    this.alert$ = this.alertService.alertEvent.subscribe((alertEvent: Alert) => {
      const alertType = alertEvent.type;
      if (alertType === SettingsService.businessDateType + ' Set Config') {
        this.isBusinessDateEnabled = alertEvent.message === 'enabled' ? true : false;
      }
    });
    this.getConfigurations();
  }

  /**
   * Get the Configuration and the Business Date data
   */
  getConfigurations(): void {
    this.systemService
      .getConfigurationByName(SettingsService.businessDateConfigName)
      .subscribe((configurationData: any) => {
        this.isBusinessDateEnabled = configurationData.enabled;
      });
  }
}
