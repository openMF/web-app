/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { CentersService } from 'app/centers/centers.service';

/**
 * Edit Center Meetings Schedule Component
 */
@Component({
  selector: 'mifosx-edit-center-meeting-schedule',
  templateUrl: './edit-center-meeting-schedule.component.html',
  styleUrls: ['./edit-center-meeting-schedule.component.scss']
})
export class EditCenterMeetingScheduleComponent implements OnInit {

  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date();
  /** Center Meeting form. */
  centerEditMeetingScheduleForm: FormGroup;
  /** Calendar Template Data */
  calendarTemplate: any;
  /** Center Id */
  centerId: any;
  /** CalendarI ID */
  calendarId: any;
  /** Next meetings data */
  nextMeetingDates: any;

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
      this.nextMeetingDates = this.calendarTemplate.nextTenRecurringDates;
    });
    this.calendarId = this.route.snapshot.queryParams['calendarId'];
    this.centerId = this.route.parent.snapshot.params['centerId'];
  }

  ngOnInit() {
    this.createEditMeetingScheduleForm();
  }

  /**
   * Creates the Edit Center Meeting Schedule form.
   */
  createEditMeetingScheduleForm() {
    this.centerEditMeetingScheduleForm = this.formBuilder.group({
      'presentMeetingDate': ['', Validators.required],
      'newMeetingDate': ['', Validators.required]
    });
  }

  /**
   * Submits the form and updates the meeting.
   */
  submit() {
    // TODO: Update once language and date settings are setup
    const locale = 'en';
    const dateFormat = 'dd MMMM yyyy';
    const reschedulebasedOnMeetingDates = true;
    const prevOldDate: Date = new Date(this.centerEditMeetingScheduleForm.value.presentMeetingDate);
    const prevNewDate: Date = this.centerEditMeetingScheduleForm.value.newMeetingDate;
    this.centerEditMeetingScheduleForm.patchValue({
      'presentMeetingDate': this.datePipe.transform(prevOldDate, dateFormat),
      'newMeetingDate': this.datePipe.transform(prevNewDate, dateFormat)
    });
    const data = {
      ...this.centerEditMeetingScheduleForm.value,
      reschedulebasedOnMeetingDates,
      dateFormat,
      locale
    };
    this.centersService.updateCenterMeeting(this.centerId, data, this.calendarId).subscribe((response: any) => {
      this.router.navigate(['../../'], { relativeTo: this.route });
    });
  }

}
