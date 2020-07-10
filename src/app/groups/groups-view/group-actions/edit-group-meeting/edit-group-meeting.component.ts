/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { GroupsService } from 'app/groups/groups.service';

/**
 * Edit Group Meetings Component
 */
@Component({
  selector: 'mifosx-edit-group-meeting',
  templateUrl: './edit-group-meeting.component.html',
  styleUrls: ['./edit-group-meeting.component.scss']
})
export class EditGroupMeetingComponent implements OnInit {

  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date();
  /** Group Meeting form. */
  groupEditMeetingForm: FormGroup;
  /** Calendar Template Data */
  calendarTemplate: any;
  /** Group Id */
  groupId: any;
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
      this.frequencyOptions = this.calendarTemplate.frequencyOptions;
      this.repeatsOnDays = this.calendarTemplate.repeatsOnDayOptions;
    });
    this.calendarId = this.route.snapshot.queryParams['calendarId'];
    this.groupId = this.route.parent.snapshot.params['groupId'];
  }

  ngOnInit() {
    this.createEditGroupMeetingForm();
    this.buildDependencies();
  }

  /**
   * Creates the Edit Group Meeting form.
   */
  createEditGroupMeetingForm() {
    this.groupEditMeetingForm = this.formBuilder.group({
      'startDate': ['', Validators.required],
      'frequency': ['', Validators.required],
      'interval': ['', Validators.required]
    });
  }

  /**
   * Subscribes to value changes of controls.
   */
  buildDependencies() {
    this.groupEditMeetingForm.get('frequency').valueChanges.subscribe((frequency: any) => {
      this.groupEditMeetingForm.removeControl('repeatsOnDay');
      switch (frequency) {
        case 1: // Daily
          this.repetitionIntervals = ['1', '2', '3'];
        break;
        case 2: // Weekly
          this.repetitionIntervals = ['1', '2', '3'];
          this.groupEditMeetingForm.addControl('repeatsOnDay', new FormControl('', Validators.required));
          this.groupEditMeetingForm.get('repeatsOnDay').patchValue(this.calendarTemplate.repeatsOnDay.id);
        break;
        case 3: // Monthly
          this.repetitionIntervals = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'];
        break;
        case 4: // Yearly
          this.repetitionIntervals = ['1', '2', '3', '4', '5'];
        break;
      }
    });
    this.groupEditMeetingForm.patchValue({
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
    const title = `groups_${this.groupId}_CollectionMeeting`;
    const typeId = '1';
    const prevStartDate: Date = this.groupEditMeetingForm.value.startDate;
    this.groupEditMeetingForm.patchValue({
      startDate: this.datePipe.transform(prevStartDate, dateFormat),
    });
    const data = {
      ...this.groupEditMeetingForm.value,
      repeating: true,
      title,
      typeId,
      dateFormat,
      locale
    };
    this.groupsService.updateGroupMeeting(this.groupId, data, this.calendarId).subscribe((response: any) => {
      this.router.navigate(['../../'], { relativeTo: this.route });
    });
  }

}
