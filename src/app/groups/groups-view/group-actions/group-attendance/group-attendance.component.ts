/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl } from '@angular/forms';

/** Custom Services */
import { GroupsService } from 'app/groups/groups.service';

/** Custom Dialogs */
import { FormDialogComponent } from 'app/shared/form-dialog/form-dialog.component';

/** Custom Models */
import { FormfieldBase } from 'app/shared/form-dialog/formfield/model/formfield-base';
import { SelectBase } from 'app/shared/form-dialog/formfield/model/select-base';

/**
 * Group Attendance component.
 */
@Component({
  selector: 'mifosx-group-attendance',
  templateUrl: './group-attendance.component.html',
  styleUrls: ['./group-attendance.component.scss']
})
export class GroupAttendanceComponent implements OnInit {

  /** Members data. */
  membersData: any;
  /** Group Data */
  groupData: any;
  /** Attendance Type Options */
  attendanceTypeOptions: any;
  /** Columns to be displayed in member's attendance table. */
  displayedColumns: string[] = ['name', 'attendance'];
  /** Start Date Form Control */
  meetingDate = new FormControl();
  /** Meeting Dates Data */
  meetingDates: any[];
  /** Data source for client members table. */
  dataSource: {}[];

  /**
   * Retrieves the group members data from `resolve`.
   * @param {ActivatedRoute} route Route
   * @param {DatePipe} datePipe Date Pipe
   * @param {Router} router Router
   * @param {GroupsService} groupsService Groups Service
   * @param {MatDialog} dialog Mat Dialog
   */
  constructor(private route: ActivatedRoute,
              private datePipe: DatePipe,
              private router: Router,
              private groupsService: GroupsService,
              public dialog: MatDialog) {
    this.route.data.subscribe(( data: { groupActionData: any }) => {
      this.groupData = data.groupActionData;
      this.membersData = data.groupActionData.clientMembers;
    });
  }

  /**
   * Sets the members table.
   */
  ngOnInit() {
    this.dataSource = this.membersData.map((member: any) => ({ clientId: member.id, attendanceType: 1 }));
    this.meetingDates = this.groupData.collectionMeetingCalendar.recurringDates
      .filter((date: any) => new Date(date).getTime() < new Date().getTime());
    this.getAttendanceOptions();
  }

  /**
   * Gets attendance type options based on calendar id.
   */
  getAttendanceOptions() {
    this.groupsService.getMeetingsTemplate(this.groupData.id, this.groupData.collectionMeetingCalendar.id)
      .subscribe((response: any) => {
        this.attendanceTypeOptions = response.attendanceTypeOptions;
      });
  }

  /**
   * Edits a member's attendance
   * @param {any} member Client Member
   */
  editAttendance(member: any) {
    const formfields: FormfieldBase[] = [
      new SelectBase({
        controlName: 'attendanceType',
        label: 'Attendance',
        value: member.attendanceType,
        options: { label: 'value', value: 'id', data: this.attendanceTypeOptions },
        required: false
      }),
    ];
    const data = {
      title: 'Assign Member Attendance',
      layout: { addButtonText: 'Confirm' },
      formfields: formfields
    };
    const memberAttendanceDialogRef = this.dialog.open(FormDialogComponent, { data });
    memberAttendanceDialogRef.afterClosed().subscribe((response: any) => {
      if (response.data) {
        const updatedMemeber = { ...member, ...response.data.value };
        this.dataSource.splice(this.dataSource.indexOf(member), 1, updatedMemeber);
        this.dataSource = this.dataSource.concat([]);
      }
    });
  }

  /**
   * Assigns Client Members Attendance
   */
  submit() {
    // TODO: Update once language and date settings are setup
    const locale = 'en';
    const dateFormat = 'dd MMMM yyyy';
    const prevMeetingDate: Date = new Date(this.meetingDate.value);
    this.meetingDate.patchValue(this.datePipe.transform(prevMeetingDate, dateFormat));
    const data = {
      meetingDate: this.meetingDate.value,
      calendarId: this.groupData.collectionMeetingCalendar.id,
      clientsAttendance: this.dataSource,
      dateFormat,
      locale
    };
    this.groupsService.assignGroupAttendance(this.groupData.id, this.groupData.collectionMeetingCalendar.id, data).subscribe(() => {
      this.router.navigate(['../../'], { relativeTo: this.route });
    });
  }

}
