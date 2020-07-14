/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { CentersService } from 'app/centers/centers.service';

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
  centerEditMeetingForm: FormGroup;
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
   * @param {DatePipe} datePipe Date Pipe
   * @param {ActivatedRoute} route Activated Route
   * @param {Router} router Router
   */
  constructor(private formBuilder: FormBuilder,
              private centersService: CentersService,
              private datePipe: DatePipe,
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
          this.centerEditMeetingForm.addControl('repeatsOnDay', new FormControl('', Validators.required));
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
    // TODO: Update once language and date settings are setup
    const locale = 'en';
    const dateFormat = 'dd MMMM yyyy';
    const title = `centers_${this.centerId}_CollectionMeeting`;
    const typeId = '1';
    const prevStartDate: Date = this.centerEditMeetingForm.value.startDate;
    this.centerEditMeetingForm.patchValue({
      startDate: this.datePipe.transform(prevStartDate, dateFormat),
    });
    const data = {
      ...this.centerEditMeetingForm.value,
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
