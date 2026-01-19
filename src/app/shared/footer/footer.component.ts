/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { Alert } from 'app/core/alert/alert.model';
import { AlertService } from 'app/core/alert/alert.service';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { Dates } from 'app/core/utils/dates';
import { SettingsService } from 'app/settings/settings.service';
import { SystemService } from 'app/system/system.service';
import { VersionService } from 'app/system/version.service';

/** Environment Configuration */
import { environment } from '../../../environments/environment';
import { Subscription } from 'rxjs';
import { NgClass, DatePipe } from '@angular/common';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 *  Footer component.
 */
@Component({
  selector: 'mifosx-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    NgClass,
    DatePipe
  ]
})
export class FooterComponent implements OnInit, OnDestroy {
  private systemService = inject(SystemService);
  private settingsService = inject(SettingsService);
  private authenticationService = inject(AuthenticationService);
  private alertService = inject(AlertService);
  private dateUtils = inject(Dates);
  private versionService = inject(VersionService);

  username: string = '';
  name: string = '';
  renderTime: Date = new Date();

  @Input() styleClass: string = '';
  @Input() variant: 'default' | 'compact' = 'default';

  /** Mifos X version. */
  versions: any = {
    mifos: environment.version,
    fineract: {
      version: '',
      hash: ''
    }
  };
  /** Mifos X hash */
  hash: string = environment.hash;
  server = '';
  /** Business Date */
  businessDate: Date = null;
  /** Tenant name */
  tenant: string;

  isBusinessDateEnabled = false;
  isBusinessDateDefined = false;
  /** Subscription to alerts. */
  alert$: Subscription;
  timer: any;

  displayBackEndInfo = true;

  constructor() {
    this.displayBackEndInfo = environment.displayBackEndInfo === 'true';
    this.setUserInfo();
    this.renderTime = new Date();
  }

  ngOnInit() {
    if (this.displayBackEndInfo) {
      this.alert$ = this.alertService.alertEvent.subscribe((alertEvent: Alert) => {
        const alertType = alertEvent.type;
        if (alertType === SettingsService.businessDateType + ' Set Config') {
          this.isBusinessDateEnabled = alertEvent.message === 'enabled' ? true : false;
          this.isBusinessDateDefined = false;
          if (this.isBusinessDateEnabled) {
            this.setBusinessDate();
          }
        } else if (alertType === SettingsService.businessDateType + ' Set') {
          if (this.isBusinessDateEnabled) {
            this.setBusinessDate();
          }
        } else if (alertType === 'Authentication Start') {
          this.timer = setTimeout(() => {
            this.getConfigurations();
          }, 60000);
        }
      });
      this.getConfigurations();
      this.server = this.settingsService.server;
      this.tenant = this.tenantIdentifier();
      this.versionService.getBackendInfo().subscribe((data: any) => {
        if (data.git && data.git.build && data.git.build.version) {
          const buildVersion: string = data.git.build.version.split('-');
          this.versions.fineract.version = buildVersion[0];
          this.versions.fineract.hash = buildVersion[1];
        }
      });
      this.setUserInfo();
    }
  }

  setUserInfo() {
    const credentials = this.authenticationService.getCredentials();
    if (credentials) {
      this.username = credentials.username;
      this.name = credentials.staffDisplayName || credentials.username;
    } else {
      this.username = '';
      this.name = '';
    }
  }

  tenantIdentifier() {
    if (!this.settingsService.tenantIdentifier || this.settingsService.tenantIdentifier === '') {
      return 'default';
    }
    return this.settingsService.tenantIdentifier;
  }

  ngOnDestroy() {
    if (this.displayBackEndInfo) {
      clearTimeout(this.timer);
    }
  }

  /**
   * Get the Configuration for Business Date
   */
  getConfigurations(): void {
    if (this.authenticationService.isAuthenticated()) {
      this.systemService
        .getConfigurationByName(SettingsService.businessDateConfigName)
        .subscribe((configurationData: any) => {
          this.isBusinessDateEnabled = configurationData.enabled;
          this.settingsService.setBusinessDateConfig(configurationData.enabled);
          if (this.isBusinessDateEnabled) {
            this.setBusinessDate();
            this.timer = setTimeout(() => {
              this.getConfigurations();
            }, 60000);
          }
        });
    } else {
      clearTimeout(this.timer);
    }
  }

  /**
   * Get the Business Date data
   */
  setBusinessDate(): void {
    this.systemService.getBusinessDate(SettingsService.businessDateType).subscribe((data: any) => {
      this.businessDate = new Date(data.date);
      this.settingsService.setBusinessDate(
        this.dateUtils.formatDate(this.businessDate, SettingsService.businessDateFormat)
      );
      this.isBusinessDateDefined = true;
    });
  }
}
