/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { Alert } from 'app/core/alert/alert.model';
import { AlertService } from 'app/core/alert/alert.service';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { Dates } from 'app/core/utils/dates';
import { SettingsService } from 'app/settings/settings.service';
import { SystemService } from 'app/system/system.service';
import { SystemInfoService, SystemInformation } from 'app/system/system-info.service';

/** Environment Configuration */
import { environment } from '../../../environments/environment';
import { Observable, Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
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
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FooterComponent implements OnInit, OnDestroy {
  /** Interval between business date configuration refreshes, in milliseconds. */
  private static readonly configurationsRefreshInterval = 60000;

  private systemService = inject(SystemService);
  private settingsService = inject(SettingsService);
  private authenticationService = inject(AuthenticationService);
  private alertService = inject(AlertService);
  private dateUtils = inject(Dates);
  private systemInfoService = inject(SystemInfoService);
  private translateService = inject(TranslateService);
  private cdr = inject(ChangeDetectorRef);

  @Input() styleClass: string = '';
  @Input() variant: 'default' | 'compact' = 'default';

  /**
   * Backend information, only resolved when `displayBackEndInfo` is enabled.
   * The full set is always available in the System Information view.
   */
  systemInformation$: Observable<SystemInformation>;

  /** Business Date */
  businessDate: Date = null;

  isBusinessDateEnabled = false;
  isBusinessDateDefined = false;
  /** Subscription to alerts. */
  alert$: Subscription;
  timer: any;

  displayBackEndInfo = true;

  constructor() {
    this.displayBackEndInfo = environment.displayBackEndInfo === 'true';
  }

  ngOnInit() {
    // The business date is kept up to date regardless of `displayBackEndInfo`: it is
    // displayed on its own and stored in the settings service for the whole application.
    this.alert$ = this.alertService.alertEvent.subscribe((alertEvent: Alert) => {
      const alertType = alertEvent.type;
      if (alertType === SettingsService.businessDateType + ' Set Config') {
        this.isBusinessDateEnabled = alertEvent.enabled ? true : false;
        this.isBusinessDateDefined = false;
        if (this.isBusinessDateEnabled) {
          this.setBusinessDate();
        }
      } else if (alertType === SettingsService.businessDateType + ' Set') {
        if (this.isBusinessDateEnabled) {
          this.setBusinessDate();
        }
      } else if (alertType === this.translateService.instant('errors.auth.startType')) {
        this.scheduleConfigurationsRefresh();
      }
    });
    this.getConfigurations();

    if (this.displayBackEndInfo) {
      this.systemInformation$ = this.systemInfoService.getSystemInformation();
    }
  }

  ngOnDestroy() {
    clearTimeout(this.timer);
    this.alert$?.unsubscribe();
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
            this.scheduleConfigurationsRefresh();
          } else {
            clearTimeout(this.timer);
          }
        });
    } else {
      clearTimeout(this.timer);
    }
  }

  /**
   * Schedules the next configuration refresh, replacing any pending one so that
   * a single polling chain is active at a time.
   */
  private scheduleConfigurationsRefresh(): void {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.getConfigurations();
    }, FooterComponent.configurationsRefreshInterval);
  }

  /**
   * Get the Business Date data
   */
  setBusinessDate(): void {
    this.systemService.getBusinessDate(SettingsService.businessDateType).subscribe({
      next: (data: any) => {
        this.businessDate = new Date(data.date);
        this.settingsService.setBusinessDate(
          this.dateUtils.formatDate(this.businessDate, SettingsService.businessDateFormat)
        );
        this.isBusinessDateDefined = true;
        this.cdr.markForCheck();
      },
      error: () => {
        // The configuration is enabled but no business date has been set on this instance yet,
        // so the footer hides it and the application keeps using the system date.
        this.isBusinessDateDefined = false;
        this.cdr.markForCheck();
      }
    });
  }
}
