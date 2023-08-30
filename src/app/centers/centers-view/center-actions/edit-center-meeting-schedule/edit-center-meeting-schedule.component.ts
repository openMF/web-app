/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { CentersService } from 'app/centers/centers.service';
import { Dates } from 'app/core/utils/dates';
import { SettingsService } from 'app/settings/settings.service';

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
  centerEditMeetingScheduleForm: UntypedFormGroup;
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
      this.nextMeetingDates = this.calendarTemplate.nextTenRecurringDates;
    });
    this.calendarId = this.route.snapshot.queryParams['calendarId'];
    this.centerId = this.route.parent.snapshot.params['centerId'];
  }

  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
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
    const centerEditMeetingScheduleFormData = this.centerEditMeetingScheduleForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const reschedulebasedOnMeetingDates = true;
    const prevOldDate: Date = new Date(this.centerEditMeetingScheduleForm.value.presentMeetingDate);
    if (centerEditMeetingScheduleFormData.startDate instanceof Date) {
      centerEditMeetingScheduleFormData.presentMeetingDate = this.dateUtils.formatDate(prevOldDate, dateFormat);
    }
    const prevNewDate: Date = this.centerEditMeetingScheduleForm.value.newMeetingDate;
    if (centerEditMeetingScheduleFormData.newMeetingDate instanceof Date) {
      centerEditMeetingScheduleFormData.newMeetingDate = this.dateUtils.formatDate(prevNewDate, dateFormat);
    }
    const data = {
      ...centerEditMeetingScheduleFormData,
      reschedulebasedOnMeetingDates,
      dateFormat,
      locale
    };
    this.centersService.updateCenterMeeting(this.centerId, data, this.calendarId).subscribe((response: any) => {
      this.router.navigate(['../../'], { relativeTo: this.route });
    });
  }

}
