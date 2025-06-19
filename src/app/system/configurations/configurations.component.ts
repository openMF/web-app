import { Component, OnInit } from '@angular/core';
import { Alert } from 'app/core/alert/alert.model';
import { AlertService } from 'app/core/alert/alert.service';
import { SettingsService } from 'app/settings/settings.service';
import { Subscription } from 'rxjs';
import { SystemService } from '../system.service';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { GlobalConfigurationsTabComponent } from './global-configurations-tab/global-configurations-tab.component';
import { NgIf } from '@angular/common';
import { BusinessDateTabComponent } from './business-date-tab/business-date-tab.component';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'mifosx-configurations',
  templateUrl: './configurations.component.html',
  styleUrls: ['./configurations.component.scss'],
  imports: [
    MatCard,
    MatCardContent,
    MatTabGroup,
    MatTab,
    GlobalConfigurationsTabComponent,
    NgIf,
    BusinessDateTabComponent,
    NgxTranslatePipe
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
