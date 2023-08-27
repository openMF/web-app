/** Angular Imports */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Alert } from 'app/core/alert/alert.model';
import { AlertService } from 'app/core/alert/alert.service';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { Dates } from 'app/core/utils/dates';
import { SettingsService } from 'app/settings/settings.service';
import { SystemService } from 'app/system/system.service';
import { VersionService } from 'app/system/version.service';

/** Environment Configuration */
import { environment } from 'environments/environment';
import { Subscription } from 'rxjs';

/**
 *  Footer component.
 */
@Component({
  selector: 'mifosx-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit, OnDestroy {

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

  isBusinessDateEnabled = false;
  isBusinessDateDefined = false;
  /** Subscription to alerts. */
  alert$: Subscription;
  timer: any;

  displayBackEndInfo: boolean = environment.displayBackEndInfo;

  constructor(private systemService: SystemService,
    private settingsService: SettingsService,
    private authenticationService: AuthenticationService,
    private alertService: AlertService,
    private dateUtils: Dates,
    private versionService: VersionService) { }

  ngOnInit() {
    this.alert$ = this.alertService.alertEvent.subscribe((alertEvent: Alert) => {
      const alertType = alertEvent.type;
      if (alertType === SettingsService.businessDateType + ' Set Config') {
        this.isBusinessDateEnabled = (alertEvent.message === 'enabled') ? true : false;
        this.isBusinessDateDefined = false;
        if (this.isBusinessDateEnabled) {
          this.setBusinessDate();
        }
      } else if (alertType === SettingsService.businessDateType + ' Set') {
        if (this.isBusinessDateEnabled) {
          this.setBusinessDate();
        }
      } else if (alertType === 'Authentication Start') {
        this.timer = setTimeout(() => { this.getConfigurations(); }, 60000);
      }
    });
    this.getConfigurations();
    this.server = this.settingsService.server;
    this.versionService.getBackendInfo().subscribe((data: any) => {
      const buildVersion: string = data.git.build.version.split('-');
      this.versions.fineract.version = buildVersion[0];
      this.versions.fineract.hash = buildVersion[1];
    });
  }

  ngOnDestroy() {
    clearTimeout(this.timer);
  }

  /**
   * Get the Configuration for Business Date
   */
  getConfigurations(): void {
    if (this.authenticationService.isAuthenticated()) {
      this.systemService.getConfigurationByName(SettingsService.businessDateConfigName)
      .subscribe((configurationData: any) => {
        this.isBusinessDateEnabled = configurationData.enabled;
        this.settingsService.setBusinessDateConfig(configurationData.enabled);
        if (this.isBusinessDateEnabled) {
          this.setBusinessDate();
          this.timer = setTimeout(() => { this.getConfigurations(); }, 60000);
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
    this.systemService.getBusinessDate(SettingsService.businessDateType)
    .subscribe((data: any) => {
      this.businessDate = new Date(data.date);
      this.settingsService.setBusinessDate(this.dateUtils.formatDate(this.businessDate, SettingsService.businessDateFormat));
      this.isBusinessDateDefined = true;
    });
  }
}
