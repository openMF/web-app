/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, UntypedFormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { CentersService } from 'app/centers/centers.service';
import { Dates } from 'app/core/utils/dates';
import { SettingsService } from 'app/settings/settings.service';

/**
 * Edit Center Meetings Component
 */
@Component({
  selector: 'mifosx-edit-center-meeting',
  templateUrl: './edit-center-meeting.component.html',
  styleUrls: ['./edit-center-meeting.component.scss']
})
export class EditCenterMeetingComponent implements OnInit {

  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date();
  /** Center Meeting form. */
  centerEditMeetingForm: UntypedFormGroup;
  /** Calendar Template Data */
  calendarTemplate: any;
  /** Center Id */
  centerId: any;
  /** Repetition Intervals */
  repetitionIntervals: any[];
  /** Frequency Options */
  frequencyOptions: any;
  /** Repetition Days Data */
  repeatsOnDays: any;
  /** CalendarI ID */
  calendarId: any;

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
    this.calendarId = this.route.snapshot.queryParams['calendarId'];
    this.centerId = this.route.parent.snapshot.params['centerId'];
  }

  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.createEditCenterMeetingForm();
    this.buildDependencies();
  }

  /**
   * Creates the Edit Center Meeting form.
   */
  createEditCenterMeetingForm() {
    this.centerEditMeetingForm = this.formBuilder.group({
      'startDate': ['', Validators.required],
      'frequency': ['', Validators.required],
      'interval': ['', Validators.required]
    });
  }

  /**
   * Subscribes to value changes of controls.
   */
  buildDependencies() {
    this.centerEditMeetingForm.get('frequency').valueChanges.subscribe((frequency: any) => {
      this.centerEditMeetingForm.removeControl('repeatsOnDay');
      switch (frequency) {
        case 1: // Daily
          this.repetitionIntervals = ['1', '2', '3'];
        break;
        case 2: // Weekly
          this.repetitionIntervals = ['1', '2', '3'];
          this.centerEditMeetingForm.addControl('repeatsOnDay', new UntypedFormControl('', Validators.required));
          this.centerEditMeetingForm.get('repeatsOnDay').patchValue(this.calendarTemplate.repeatsOnDay.id);
        break;
        case 3: // Monthly
          this.repetitionIntervals = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'];
        break;
        case 4: // Yearly
          this.repetitionIntervals = ['1', '2', '3', '4', '5'];
        break;
      }
    });
    this.centerEditMeetingForm.patchValue({
      'startDate': this.calendarTemplate.startDate && new Date(this.calendarTemplate.startDate),
      'frequency': this.calendarTemplate.frequency.id,
      'interval': `${this.calendarTemplate.interval}`
    });
  }

  /**
   * Navigate to edit meeting schedule form.
   */
  editSchedule() {
    const queryParams: any = { calendarId: this.calendarId };
    this.router.navigate([`../Edit Meeting Schedule`], { relativeTo: this.route, queryParams: queryParams });
  }

  /**
   * Submits the form and updates the meeting.
   */
  submit() {
    const centerEditMeetingFormData = this.centerEditMeetingForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const title = `centers_${this.centerId}_CollectionMeeting`;
    const typeId = '1';
    const prevStartDate: Date = this.centerEditMeetingForm.value.startDate;
    if (centerEditMeetingFormData.startDate instanceof Date) {
      centerEditMeetingFormData.startDate = this.dateUtils.formatDate(prevStartDate, dateFormat);
    }
    const data = {
      ...centerEditMeetingFormData,
      repeating: true,
      title,
      typeId,
      dateFormat,
      locale
    };
    this.centersService.updateCenterMeeting(this.centerId, data, this.calendarId).subscribe((response: any) => {
      this.router.navigate(['../../'], { relativeTo: this.route });
    });
  }

}
