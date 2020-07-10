/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { GroupsService } from 'app/groups/groups.service';

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
  groupEditMeetingScheduleForm: FormGroup;
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
   * @param {DatePipe} datePipe Date Pipe
   * @param {ActivatedRoute} route Activated Route
   * @param {Router} router Router
   */
  constructor(private formBuilder: FormBuilder,
              private groupsService: GroupsService,
              private datePipe: DatePipe,
              private route: ActivatedRoute,
              private router: Router) {
    this.route.data.subscribe((data: { groupActionData: any }) => {
      this.calendarTemplate = data.groupActionData;
      this.nextMeetingDates = this.calendarTemplate.nextTenRecurringDates;
    });
    this.calendarId = this.route.snapshot.queryParams['calendarId'];
    this.groupId = this.route.parent.snapshot.params['groupId'];
  }

  ngOnInit() {
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
    // TODO: Update once language and date settings are setup
    const locale = 'en';
    const dateFormat = 'dd MMMM yyyy';
    const reschedulebasedOnMeetingDates = true;
    const prevOldDate: Date = new Date(this.groupEditMeetingScheduleForm.value.presentMeetingDate);
    const prevNewDate: Date = this.groupEditMeetingScheduleForm.value.newMeetingDate;
    this.groupEditMeetingScheduleForm.patchValue({
      'presentMeetingDate': this.datePipe.transform(prevOldDate, dateFormat),
      'newMeetingDate': this.datePipe.transform(prevNewDate, dateFormat)
    });
    const data = {
      ...this.groupEditMeetingScheduleForm.value,
      reschedulebasedOnMeetingDates,
      dateFormat,
      locale
    };
    this.groupsService.updateGroupMeeting(this.groupId, data, this.calendarId).subscribe((response: any) => {
      this.router.navigate(['../../'], { relativeTo: this.route });
    });
  }

}
