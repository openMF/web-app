/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Dates } from 'app/core/utils/dates';

/** Custom Services */
import { GroupsService } from 'app/groups/groups.service';
import { SettingsService } from 'app/settings/settings.service';
import { MatCard, MatCardContent, MatCardActions } from '@angular/material/card';
import { MatFormField, MatLabel, MatError, MatSuffix } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { NgFor, NgIf } from '@angular/common';
import { MatOption } from '@angular/material/autocomplete';
import { MatInput } from '@angular/material/input';
import { MatDatepickerInput, MatDatepickerToggle, MatDatepicker } from '@angular/material/datepicker';
import { MatButton } from '@angular/material/button';
import { HasPermissionDirective } from '../../../../directives/has-permission/has-permission.directive';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';
import { DateFormatPipe } from '../../../../pipes/date-format.pipe';

/**
 * Edit Group Meetings Schedule Component
 */
@Component({
  selector: 'mifosx-edit-group-meeting-schedule',
  templateUrl: './edit-group-meeting-schedule.component.html',
  styleUrls: ['./edit-group-meeting-schedule.component.scss'],
  imports: [
    MatCard,
    ReactiveFormsModule,
    MatCardContent,
    MatFormField,
    MatLabel,
    MatSelect,
    NgFor,
    MatOption,
    NgIf,
    MatError,
    MatInput,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatSuffix,
    MatDatepicker,
    MatCardActions,
    MatButton,
    RouterLink,
    HasPermissionDirective,
    TranslatePipe,
    DateFormatPipe,
    NgxTranslatePipe
  ]
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
  constructor(
    private formBuilder: UntypedFormBuilder,
    private groupsService: GroupsService,
    private dateUtils: Dates,
    private route: ActivatedRoute,
    private router: Router,
    private settingsService: SettingsService
  ) {
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
      presentMeetingDate: [
        '',
        Validators.required
      ],
      newMeetingDate: [
        '',
        Validators.required
      ]
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
