/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Dates } from 'app/core/utils/dates';

/** Custom Services */
import { GroupsService } from 'app/groups/groups.service';
import { SettingsService } from 'app/settings/settings.service';

/**
 * Group Meetings Component
 */
@Component({
  selector: 'mifosx-attach-group-meeting',
  templateUrl: './attach-group-meeting.component.html',
  styleUrls: ['./attach-group-meeting.component.scss']
})
export class AttachGroupMeetingComponent implements OnInit {

  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date();
  /** Group Meeting form. */
  groupMeetingForm: FormGroup;
  /** Calnedar Template Data */
  calendarTemplate: any;
  /** Group Id */
  groupId: any;
  /** Repetition Intervals */
  repetitionIntervals: any[];
  /** Frequency Options */
  frequencyOptions: any;
  /** Repetition Days Data */
  repeatsOnDays: any;

  /**
   * Fetches Calendar Template from `resolve`
   * @param {FormBuilder} formBuilder Form Builder
   * @param {GroupsService} groupsService Shares Service
   * @param {Dates} dateUtils Date Utils
   * @param {ActivatedRoute} route Activated Route
   * @param {Router} router Router
   * @param {SettingsService} settingsService SettingsService
   */
  constructor(private formBuilder: FormBuilder,
              private groupsService: GroupsService,
              private dateUtils: Dates,
              private route: ActivatedRoute,
              private router: Router,
              private settingsService: SettingsService) {
    this.route.data.subscribe((data: { groupActionData: any }) => {
      this.calendarTemplate = data.groupActionData;
      this.frequencyOptions = this.calendarTemplate.frequencyOptions;
      this.repeatsOnDays = this.calendarTemplate.repeatsOnDayOptions;
    });
    this.groupId = this.route.parent.snapshot.params['groupId'];
  }

  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.createGroupMeetingForm();
    this.buildDependencies();
  }

  /**
   * Creates the Group Meeting form.
   */
  createGroupMeetingForm() {
    this.groupMeetingForm = this.formBuilder.group({
      'startDate': ['', Validators.required],
      'repeating': [false]
    });
  }

  /**
   * Subscribes to value changes of controls.
   */
  buildDependencies() {
    this.groupMeetingForm.get('repeating').valueChanges.subscribe((value: boolean) => {
      if (value) {
        this.groupMeetingForm.addControl('frequency', new FormControl());
        this.groupMeetingForm.addControl('interval', new FormControl());
        this.groupMeetingForm.get('frequency').valueChanges.subscribe((frequency: any) => {
          this.groupMeetingForm.removeControl('repeatsOnDay');
          switch (frequency) {
            case 1: // Daily
              this.repetitionIntervals = ['1', '2', '3'];
            break;
            case 2: // Weekly
              this.repetitionIntervals = ['1', '2', '3'];
              this.groupMeetingForm.addControl('repeatsOnDay', new FormControl('', Validators.required));
            break;
            case 3: // Monthly
              this.repetitionIntervals = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'];
            break;
            case 4: // Yearly
              this.repetitionIntervals = ['1', '2', '3', '4', '5'];
            break;
          }
        });
        this.groupMeetingForm.patchValue({
          'frequency': 1,
          'interval': '1'
        });
      } else {
        this.groupMeetingForm.removeControl('frequency');
        this.groupMeetingForm.removeControl('interval');
      }
    });
  }

  /**
   * Submits the form and attatches the meeting.
   */
  submit() {
    const groupMeetingFormData = this.groupMeetingForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const title = `groups_${this.groupId}_CollectionMeeting`;
    const typeId = '1';
    const prevStartDate: Date = this.groupMeetingForm.value.startDate;
    if (groupMeetingFormData.startDate instanceof Date) {
      groupMeetingFormData.startDate = this.dateUtils.formatDate(prevStartDate, dateFormat);
    }
    const data = {
      ...groupMeetingFormData,
      title,
      typeId,
      dateFormat,
      locale
    };
    this.groupsService.createGroupMeeting(this.groupId, data).subscribe((response: any) => {
      this.router.navigate(['../../'], { relativeTo: this.route });
    });
  }

}
