/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Dates } from 'app/core/utils/dates';

/** Custom Services */
import { GroupsService } from 'app/groups/groups.service';
import { SettingsService } from 'app/settings/settings.service';

/**
 * Edit Group Meetings Schedule Component
 */
@Component({
  selector: 'mifosx-edit-group-meeting-schedule',
  templateUrl: './edit-group-meeting-schedule.component.html',
  styleUrls: ['./edit-group-meeting-schedule.component.scss']
})
export class EditGroupMeetingScheduleComponent implements OnInit {

  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date();
  /** Group Meeting form. */
  groupEditMeetingScheduleForm: UntypedFormGroup;
  /** Calendar Template Data */
  calendarTemplate: any;
  /** Group Id */
  groupId: any;
  /** CalendarI ID */
  calendarId: any;
  /** Next meetings data */
  nextMeetingDates: any;

  /**
   * Fetches Calendar Template from `resolve`
   * @param {FormBuilder} formBuilder Form Builder
   * @param {GroupsService} groupsService Shares Service
   * @param {Dates} dateUtils Date Utils
   * @param {ActivatedRoute} route Activated Route
   * @param {Router} router Router
   * @param {SettingsService} settingsService SettingsService
   */
  constructor(private formBuilder: UntypedFormBuilder,
              private groupsService: GroupsService,
              private dateUtils: Dates,
              private route: ActivatedRoute,
              private router: Router,
              private settingsService: SettingsService) {
    this.route.data.subscribe((data: { groupActionData: any }) => {
      this.calendarTemplate = data.groupActionData;
      this.nextMeetingDates = this.calendarTemplate.nextTenRecurringDates;
    });
    this.calendarId = this.route.snapshot.queryParams['calendarId'];
    this.groupId = this.route.parent.snapshot.params['groupId'];
  }

  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.createEditMeetingScheduleForm();
  }

  /**
   * Creates the Edit Group Meeting Schedule form.
   */
  createEditMeetingScheduleForm() {
    this.groupEditMeetingScheduleForm = this.formBuilder.group({
      'presentMeetingDate': ['', Validators.required],
      'newMeetingDate': ['', Validators.required]
    });
  }

  /**
   * Submits the form and updates the meeting.
   */
  submit() {
    const groupEditMeetingScheduleFormData = this.groupEditMeetingScheduleForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const reschedulebasedOnMeetingDates = true;
    const prevOldDate: Date = new Date(this.groupEditMeetingScheduleForm.value.presentMeetingDate);
    const prevNewDate: Date = this.groupEditMeetingScheduleForm.value.newMeetingDate;
    if (groupEditMeetingScheduleFormData.presentMeetingDate instanceof Date) {
      groupEditMeetingScheduleFormData.presentMeetingDate = this.dateUtils.formatDate(prevOldDate, dateFormat);
    }
    if (groupEditMeetingScheduleFormData.newMeetingDate instanceof Date) {
      groupEditMeetingScheduleFormData.newMeetingDate = this.dateUtils.formatDate(prevNewDate, dateFormat);
    }
    const data = {
      ...groupEditMeetingScheduleFormData,
      reschedulebasedOnMeetingDates,
      dateFormat,
      locale
    };
    this.groupsService.updateGroupMeeting(this.groupId, data, this.calendarId).subscribe((response: any) => {
      this.router.navigate(['../../'], { relativeTo: this.route });
    });
  }

}
