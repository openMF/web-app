/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

import { ActivatedRoute } from '@angular/router';
import { Alert } from 'app/core/alert/alert.model';
import { AlertService } from 'app/core/alert/alert.service';
import { Dates } from 'app/core/utils/dates';
import { SettingsService } from 'app/settings/settings.service';
import { Subscription } from 'rxjs';

/** Custom Services */
import { SystemService } from '../../system.service';

@Component({
  selector: 'mifosx-business-date-tab',
  templateUrl: './business-date-tab.component.html',
  styleUrls: ['./business-date-tab.component.scss']
})
export class BusinessDateTabComponent implements OnInit {
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
    private dateUtils: Dates,
    private alertService: AlertService) {}

  ngOnInit(): void {
    this.alert$ = this.alertService.alertEvent.subscribe((alertEvent: Alert) => {
      const alertType = alertEvent.type;
      if (alertType === SettingsService.businessDateType + ' Set Config') {
        this.isBusinessDateEnabled = (alertEvent.message === 'enabled') ? true : false;
        if (this.isBusinessDateEnabled) {
          this.setBusinessDates();
          this.createBusinessDateForm();
        }
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
    this.systemService.getConfigurationByName(SettingsService.businessDateConfigName)
    .subscribe((configurationData: any) => {
      this.isBusinessDateEnabled = configurationData.enabled;
      if (this.isBusinessDateEnabled) {
        this.setBusinessDates();
      }
    });
  }

  setBusinessDates(): void {
    this.systemService.getBusinessDates()
    .subscribe((businessDateData: any) => {
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
    });
  }

  /**
   * Creates the Business Date form.
   */
  createBusinessDateForm(): void {
    this.businessDateForm = this.formBuilder.group({
      'businessDate': [new Date(), Validators.required],
      'cobDate': [new Date(), Validators.required],
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
    const prevBusinessDate: Date = this.businessDateForm.value.businessDate;
    let dateType = SettingsService.businessDateType;
    if (this.dateIndex === 1) {
      dateType = SettingsService.cobDateType;
    }
    const data = {
      date: this.dateUtils.formatDate(prevBusinessDate, dateFormat),
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
