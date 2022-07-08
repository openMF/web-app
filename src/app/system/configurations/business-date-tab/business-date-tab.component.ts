/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ActivatedRoute } from '@angular/router';
import { Dates } from 'app/core/utils/dates';
import { SettingsService } from 'app/settings/settings.service';

/** Custom Services */
import { SystemService } from '../../system.service';

@Component({
  selector: 'mifosx-business-date-tab',
  templateUrl: './business-date-tab.component.html',
  styleUrls: ['./business-date-tab.component.scss']
})
export class BusinessDateTabComponent implements OnInit {

  configurationName = 'enable_business_date';
  businessDateType = 'BUSINESS_DATE';
  cobDateType = 'COB_DATE';

  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date(2100, 0, 1);
  /** Business date */
  businessDate = new Date();
  /** COB date */
  cobDate = new Date();
  /** business Date form. */
  businessDateForm: FormGroup;
  /** Configuration data. */
  configurations: any;
  /** Business data. */
  businessDateData: any;

  dateIndex = 0;
  userDateFormat: '';
  isBusinessDateEnabled = false;
  isEditInProgress = false;

  /**
   * Retrieves the configurations data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   * @param {SystemService} systemService System Service.
   * @param {Router} router Router for navigation.
   */
  constructor(private route: ActivatedRoute,
    private systemService: SystemService,
    private settingsService: SettingsService,
    private formBuilder: FormBuilder,
    private dateUtils: Dates) {}

  ngOnInit(): void {
    this.userDateFormat = this.settingsService.dateFormat;
    this.getConfigurations();
    this.createBusinessDateForm();
  }

  /**
   * Get the Configuration and the Business Date data
   */
  getConfigurations(): void {
    this.systemService.getConfigurations()
    .subscribe((configurationData: any) => {
      this.configurations = configurationData.globalConfiguration;
      this.validateBusinessDateStatus();
      if (this.isBusinessDateEnabled) {
        this.systemService.getBusinessDates()
        .subscribe((businessDateData: any) => {
          this.businessDateData = businessDateData;
          this.setBusinessDates();
        });
      }
    });
  }

  /**
   * Set the Business Date and COB Date.
   */
  setBusinessDates() {
    this.businessDateData.forEach((data: any) => {
      if (data.type === this.businessDateType) {
        this.businessDate = new Date(data.date);
      } else {
        this.cobDate = new Date(data.date);
      }
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
   * Validate If the enable_business_date configuration is enabled or disabled.
   */
  validateBusinessDateStatus(): void {
    this.isBusinessDateEnabled = false;
    this.configurations.forEach((config: any) => {
      if (config.name === this.configurationName) {
        this.isBusinessDateEnabled = config.enabled;
      }
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
    let dateType = this.businessDateType;
    if (this.dateIndex === 1) {
      dateType = this.cobDateType;
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
