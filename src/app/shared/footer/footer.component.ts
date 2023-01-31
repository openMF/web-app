/** Angular Imports */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Alert } from 'app/core/alert/alert.model';
import { AlertService } from 'app/core/alert/alert.service';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { SettingsService } from 'app/settings/settings.service';
import { SystemService } from 'app/system/system.service';

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
  version: string = environment.version;
  /** Mifos X hash */
  hash: string = environment.hash;
  /** Business Date */
  businessDate: Date = null;

  isBusinessDateEnabled = false;
  isBusinessDateDefined = false;
  /** Subscription to alerts. */
  alert$: Subscription;
  timer: any;

  constructor(private systemService: SystemService,
    private authenticationService: AuthenticationService,
    private alertService: AlertService) { }

  ngOnInit() {
    this.alert$ = this.alertService.alertEvent.subscribe((alertEvent: Alert) => {
      const alertType = alertEvent.type;
      if (alertType === SettingsService.businessDateType + ' Set Config') {
        this.isBusinessDateEnabled = (alertEvent.message === 'enabled') ? true : false;
        this.isBusinessDateDefined = false;
        if (this.isBusinessDateEnabled) {
          //this.setBusinessDate();
        }
      } else if (alertType === SettingsService.businessDateType + ' Set') {
        if (this.isBusinessDateEnabled) {
        }
      } else if (alertType === 'Authentication Start') {
      }
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
        if (this.isBusinessDateEnabled) {
          this.setBusinessDate();
          this.timer = setTimeout(() => { this.getConfigurations(); }, 60000);
        }
      });
    }
  }

  /**
   * Get the Business Date data
   */
  setBusinessDate(): void {
    this.systemService.getBusinessDate(SettingsService.businessDateType)
    .subscribe((data: any) => {
      this.businessDate = new Date(data.date);
      this.isBusinessDateDefined = true;
    });
  }
}
