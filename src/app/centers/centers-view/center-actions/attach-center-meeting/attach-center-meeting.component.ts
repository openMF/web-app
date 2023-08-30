/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, UntypedFormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { CentersService } from 'app/centers/centers.service';
import { Dates } from 'app/core/utils/dates';
import { SettingsService } from 'app/settings/settings.service';

/**
 * Center Meetings Component
 */
@Component({
  selector: 'mifosx-attach-center-meeting',
  templateUrl: './attach-center-meeting.component.html',
  styleUrls: ['./attach-center-meeting.component.scss']
})
export class AttachCenterMeetingComponent implements OnInit {

  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date();
  /** Center Meeting form. */
  centerMeetingForm: UntypedFormGroup;
  /** Calnedar Template Data */
  calendarTemplate: any;
  /** Center Id */
  centerId: any;
  /** Repetition Intervals */
  repetitionIntervals: any[];
  /** Frequency Options */
  frequencyOptions: any;
  /** Repetition Days Data */
  repeatsOnDays: any;

  /**
   * Fetches Calendar Template from `resolve`
   * @param {FormBuilder} formBuilder Form Builder
   * @param {CentersService} centersService Shares Service
   * @param {SettingsService} settingsService Settings Service.
   * @param {Dates} dateUtils Date Utils
   * @param {ActivatedRoute} route Activated Route
   * @param {Router} router Router
   */
  constructor(private formBuilder: UntypedFormBuilder,
              private centersService: CentersService,
              private settingsService: SettingsService,
              private dateUtils: Dates,
              private route: ActivatedRoute,
              private router: Router) {
    this.route.data.subscribe((data: { centersActionData: any }) => {
      this.calendarTemplate = data.centersActionData;
      this.frequencyOptions = this.calendarTemplate.frequencyOptions;
      this.repeatsOnDays = this.calendarTemplate.repeatsOnDayOptions;
    });
    this.centerId = this.route.parent.snapshot.params['centerId'];
  }

  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.createCenterMeetingForm();
    this.buildDependencies();
  }

  /**
   * Creates the Center Meeting form.
   */
  createCenterMeetingForm() {
    this.centerMeetingForm = this.formBuilder.group({
      'startDate': ['', Validators.required],
      'repeating': [false]
    });
  }

  /**
   * Subscribes to value changes of controls.
   */
  buildDependencies() {
    this.centerMeetingForm.get('repeating').valueChanges.subscribe((value: boolean) => {
      if (value) {
        this.centerMeetingForm.addControl('frequency', new UntypedFormControl());
        this.centerMeetingForm.addControl('interval', new UntypedFormControl());
        this.centerMeetingForm.get('frequency').valueChanges.subscribe((frequency: any) => {
          this.centerMeetingForm.removeControl('repeatsOnDay');
          switch (frequency) {
            case 1: // Daily
              this.repetitionIntervals = ['1', '2', '3'];
            break;
            case 2: // Weekly
              this.repetitionIntervals = ['1', '2', '3'];
              this.centerMeetingForm.addControl('repeatsOnDay', new UntypedFormControl('', Validators.required));
            break;
            case 3: // Monthly
              this.repetitionIntervals = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'];
            break;
            case 4: // Yearly
              this.repetitionIntervals = ['1', '2', '3', '4', '5'];
            break;
          }
        });
        this.centerMeetingForm.patchValue({
          'frequency': 1,
          'interval': '1'
        });
      } else {
        this.centerMeetingForm.removeControl('frequency');
        this.centerMeetingForm.removeControl('interval');
      }
    });
  }

  /**
   * Submits the form and attatches the meeting.
   */
  submit() {
    const centerMeetingFormData = this.centerMeetingForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const title = `centers_${this.centerId}_CollectionMeeting`;
    const typeId = '1';
    const prevStartDate: Date = this.centerMeetingForm.value.startDate;
    if (centerMeetingFormData.startDate instanceof Date) {
      centerMeetingFormData.startDate = this.dateUtils.formatDate(prevStartDate, dateFormat);
    }
    const data = {
      ...centerMeetingFormData,
      title,
      typeId,
      dateFormat,
      locale
    };
    this.centersService.createCenterMeeting(this.centerId, data).subscribe((response: any) => {
      this.router.navigate(['../../'], { relativeTo: this.route });
    });
  }

}
