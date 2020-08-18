/** Angular Imports */
import { Component, OnInit, Input, ViewChild, EventEmitter, Output} from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';

/** Custom Services */
import { ReportsService } from 'app/reports/reports.service';

/** Custom Models */
import { ReportParameter } from 'app/reports/common-models/report-parameter.model';

/** Custom Components */
import { BusinessRuleParametersComponent } from './business-rule-parameters/business-rule-parameters.component';

/**
 * SMS Campaign Step Component
 */
@Component({
  selector: 'mifosx-sms-campaign-step',
  templateUrl: './sms-campaign-step.component.html',
  styleUrls: ['./sms-campaign-step.component.scss']
})
export class SmsCampaignStepComponent implements OnInit {

  /** SMS Campaign Template */
  @Input() smsCampaignTemplate: any;
  /** Business Rule Parameters Component */
  @ViewChild(BusinessRuleParametersComponent) businessRuleParametersComponent: BusinessRuleParametersComponent;

  /** Min. Date */
  minDate = new Date();
  /** Max. Date */
  maxDate = new Date(new Date().setFullYear(new Date().getFullYear() + 10));

  /** SMS Campaign Form */
  smsCampaignDetailsForm: FormGroup;
  /** Data to be passed to sub component */
  paramData: any;
  /** Trigger types options */
  triggerTypes: any[];
  /** SMS providers options */
  smsProviders: any[];
  /** Business Rules options */
  businessRules: any[];
  /** Repetition Intervals */
  repetitionIntervals: any[];

  /** Template Parameters Event Emitter */
  @Output() templateParameters = new EventEmitter();

  /**
   * @param {FormBuilder} formBuilder Form Builder
   * @param {ReportsService} reportService Reports Service
   */
  constructor(private formBuilder: FormBuilder,
              private reportService: ReportsService) {
    this.createSMSCampaignDetailsForm();
    this.buildDependencies();
  }

  /**
   * Sets SMS providers and trigger types options.
   */
  ngOnInit() {
    this.triggerTypes = this.smsCampaignTemplate.triggerTypeOptions;
    this.smsProviders = this.smsCampaignTemplate.smsProviderOptions;
  }

  /**
   * Returns SMS Campaign Details Form if Business Rule is unassigned
   * Else returns a cumulative form group.
   */
  get smsCampaignFormGroup() {
    let smsCampaignFormGroup: FormGroup;
    if (this.businessRuleParametersComponent) {
      smsCampaignFormGroup = new FormGroup({
        smsCampaign: this.smsCampaignDetailsForm,
        businessRule: this.businessRuleParametersComponent.ReportForm
      });
    } else {
      smsCampaignFormGroup = new FormGroup({
        smsCampaign: this.smsCampaignDetailsForm
      });
    }
    return smsCampaignFormGroup;
  }

  /**
   * Returns SMS Campaign Details Form value if Business Rule is unassigned
   * Else returns cumulative form group value.
   */
  get smsCampaignFormGroupValue() {
    if (this.businessRuleParametersComponent) {
      return {
        ...this.smsCampaignDetailsForm.value,
        ...this.businessRuleParametersComponent.businessRuleFormValue
      };
    } else {
      return this.smsCampaignDetailsForm.value;
    }
  }

  /**
   * Passes template parameters emitted from child to parent.
   * @param {any} $event Template Parameters
   */
  passParameters($event: any) {
    this.templateParameters.emit($event);
  }

  /**
   * Initializes the SMS campaign form.
   */
  createSMSCampaignDetailsForm() {
    this.smsCampaignDetailsForm = this.formBuilder.group({
      'campaignName': ['', Validators.required],
      'providerId': [null],
      'triggerType': ['', Validators.required],
      'runReportId': ['', Validators.required],
      'isNotification': [false]
    });
  }

  /**
   * Sets conditional form controls and values.
   * Gets reports parameters and passes it to subcomponent on business rule value changes.
   */
  buildDependencies() {
    this.smsCampaignDetailsForm.get('isNotification').valueChanges.subscribe((value: boolean) => {
      if (!value) {
        this.smsCampaignDetailsForm.addControl('providerId', new FormControl(null));
      } else {
        this.smsCampaignDetailsForm.removeControl('providerId');
      }
    });
    this.smsCampaignDetailsForm.get('runReportId').valueChanges.subscribe((value: number) => {
      if (value) {
        const report = this.businessRules.find((rule: any) => rule.reportId === value);
        this.reportService.getReportParams(report.reportName).subscribe((response: ReportParameter[]) => {
          this.paramData = { response, reportName: report.reportName };
        });
      }
    });
    this.smsCampaignDetailsForm.get('triggerType').valueChanges.subscribe((value: number) => {
      this.templateParameters.emit(null);
      this.businessRules = this.smsCampaignTemplate.businessRulesOptions;
      if (this.smsCampaignDetailsForm.controls.runReportId.value) {
        this.smsCampaignDetailsForm.get('runReportId').patchValue('');
      }
      if (value === 3) {
        this.businessRules = this.businessRules.filter((rule: any) => rule.reportSubType === 'Triggered');
      } else {
        this.businessRules = this.businessRules.filter((rule: any) => rule.reportSubType !== 'Triggered');
      }
      if (value === 2) {
        this.smsCampaignDetailsForm.addControl('recurrenceStartDate', new FormControl('', Validators.required));
        this.smsCampaignDetailsForm.addControl('frequency', new FormControl('', Validators.required));
        this.smsCampaignDetailsForm.addControl('interval', new FormControl('', Validators.required));
        this.smsCampaignDetailsForm.get('frequency').valueChanges.subscribe((frequency: number) => {
          this.smsCampaignDetailsForm.removeControl('repeatsOnDay');
          switch (frequency) {
            case 1: // Daily
              this.repetitionIntervals = ['1', '2', '3'];
            break;
            case 2: // Weekly
              this.repetitionIntervals = ['1', '2', '3'];
              this.smsCampaignDetailsForm.addControl('repeatsOnDay', new FormControl('', Validators.required));
            break;
            case 3: // Monthly
              this.repetitionIntervals = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'];
            break;
            case 4: // Yearly
              this.repetitionIntervals = ['1', '2', '3', '4', '5'];
            break;
          }
        });
      } else {
        this.smsCampaignDetailsForm.removeControl('recurrenceStartDate');
        this.smsCampaignDetailsForm.removeControl('frequency');
        this.smsCampaignDetailsForm.removeControl('interval');
        this.smsCampaignDetailsForm.removeControl('repeatsOnDay');
      }
    });
  }

}
