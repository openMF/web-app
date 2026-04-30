/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

import { Alert } from 'app/core/alert/alert.model';
import { AlertService } from 'app/core/alert/alert.service';
import { Dates } from 'app/core/utils/dates';
import { SettingsService } from 'app/settings/settings.service';
import { Subscription } from 'rxjs';

/** Custom Services */
import { SystemService } from '../../system.service';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { DateFormatPipe } from '../../../pipes/date-format.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { MatDivider } from '@angular/material/divider';

@Component({
  selector: 'mifosx-business-date-tab',
  templateUrl: './business-date-tab.component.html',
  styleUrls: ['./business-date-tab.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatIconButton,
    MatTooltip,
    MatDivider,
    FaIconComponent,
    DateFormatPipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BusinessDateTabComponent implements OnInit {
  private systemService = inject(SystemService);
  private settingsService = inject(SettingsService);
  private formBuilder = inject(UntypedFormBuilder);
  private dateUtils = inject(Dates);
  private alertService = inject(AlertService);
  private cdr = inject(ChangeDetectorRef);

  /** Subscription to alerts. */
  alert$: Subscription;

  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date(2100, 0, 1);
  /** Business date */
  businessDate = new Date();
  /** COB date */
  cobDate = new Date();
  /** business Date form. */
  businessDateForm: UntypedFormGroup;
  /** Business data. */
  businessDateData: any;

  dateIndex = 0;
  userDateFormat: '';
  isBusinessDateEnabled = false;
  isEditInProgress = false;
  configurationName = SettingsService.businessDateConfigName;

  ngOnInit(): void {
    this.alert$ = this.alertService.alertEvent.subscribe((alertEvent: Alert) => {
      const alertType = alertEvent.type;
      if (alertType === SettingsService.businessDateType + ' Set Config') {
        this.isBusinessDateEnabled = alertEvent.enabled ? true : false;
        if (this.isBusinessDateEnabled) {
          this.setBusinessDates();
          this.createBusinessDateForm();
        }
        this.cdr.markForCheck();
      }
    });
    this.userDateFormat = this.settingsService.dateFormat;
    this.getConfigurations();
    this.createBusinessDateForm();
  }

  /**
   * Get the Configuration and the Business Date data
   */
  getConfigurations(): void {
    this.systemService
      .getConfigurationByName(SettingsService.businessDateConfigName)
      .subscribe((configurationData: any) => {
        this.isBusinessDateEnabled = configurationData.enabled;
        if (this.isBusinessDateEnabled) {
          this.setBusinessDates();
        }
        this.cdr.markForCheck();
      });
  }

  setBusinessDates(): void {
    this.systemService.getBusinessDates().subscribe((businessDateData: any) => {
      businessDateData.forEach((data: any) => {
        if (data.type === SettingsService.businessDateType) {
          this.businessDate = new Date(data.date);
          this.businessDateForm.patchValue({
            businessDate: this.businessDate
          });
        } else {
          this.cobDate = new Date(data.date);
          this.businessDateForm.patchValue({
            cobDate: this.cobDate
          });
        }
      });
      this.cdr.markForCheck();
    });
  }

  /**
   * Creates the Business Date form.
   */
  createBusinessDateForm(): void {
    this.businessDateForm = this.formBuilder.group({
      businessDate: [
        new Date(),
        Validators.required
      ],
      cobDate: [
        new Date(),
        Validators.required
      ]
    });
  }

  /**
   * Flag to display or not the datepicker control to set the Business Date value
   */
  editInProgressToggle(index: any): void {
    this.dateIndex = index;
    this.isEditInProgress = !this.isEditInProgress;
  }

  submit() {
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const isCob = this.dateIndex === 1;
    const dateValue: Date = isCob ? this.businessDateForm.value.cobDate : this.businessDateForm.value.businessDate;
    const dateType = isCob ? SettingsService.cobDateType : SettingsService.businessDateType;
    const data = {
      date: this.dateUtils.formatDate(dateValue, dateFormat),
      type: dateType,
      dateFormat,
      locale
    };
    this.systemService.updateBusinessDate(data).subscribe((response: any) => {
      this.getConfigurations();
      this.editInProgressToggle(this.dateIndex);
    });
  }
}
