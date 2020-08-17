/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl } from '@angular/forms';

/** Custom Services */
import { CentersService } from 'app/centers/centers.service';

/** Custom Dialogs */
import { FormDialogComponent } from 'app/shared/form-dialog/form-dialog.component';

/** Custom Models */
import { FormfieldBase } from 'app/shared/form-dialog/formfield/model/formfield-base';
import { SelectBase } from 'app/shared/form-dialog/formfield/model/select-base';

/**
 * Center Attendance component.
 */
@Component({
  selector: 'mifosx-center-attendance',
  templateUrl: './center-attendance.component.html',
  styleUrls: ['./center-attendance.component.scss']
})
export class CenterAttendanceComponent implements OnInit {

  /** Members data. */
  membersData: any;
  /** Center Data */
  centerData: any;
  /** Attendance Type Options */
  attendanceTypeOptions: any;
  /** Columns to be displayed in member's attendance table. */
  displayedColumns: string[] = ['name', 'attendance'];
  /** Start Date Form Control */
  meetingDate = new FormControl();
  /** Meeting Dates Data */
  meetingDates: any[];
  /** Data source for client members table. */
  dataSource: {}[] = [];
  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date();

  /**
   * Retrieves the center members data from `resolve`.
   * @param {ActivatedRoute} route Route
   * @param {DatePipe} datePipe Date Pipe
   * @param {Router} router Router
   * @param {CentersService} centersService Centers Service
   * @param {MatDialog} dialog Mat Dialog
   */
  constructor(private route: ActivatedRoute,
              private datePipe: DatePipe,
              private router: Router,
              private centersService: CentersService,
              public dialog: MatDialog) {
    this.route.data.subscribe(( data: { centersActionData: any }) => {
      this.centerData = data.centersActionData;
      this.membersData = data.centersActionData.clients;
    });
  }

  /**
   * Sets the members table.
   */
  ngOnInit() {
    if (this.membersData !== undefined && this.membersData !== null) {
      this.dataSource = this.membersData.map((member: any) => ({ clientId: member.id, attendanceType: 1 }));
    }
    this.meetingDates = this.centerData.collectionMeetingCalendar.recurringDates
      .filter((date: any) => new Date(date).getTime() < new Date().getTime());
    this.getAttendanceOptions();
  }

  /**
   * Gets attendance type options based on calendar id.
   */
  getAttendanceOptions() {
    this.centersService.getMeetingsTemplate(this.centerData.id, this.centerData.collectionMeetingCalendar.id)
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
      calendarId: this.centerData.collectionMeetingCalendar.id,
      clientsAttendance: this.dataSource,
      dateFormat,
      locale
    };
    this.centersService.assignCenterAttendance(this.centerData.id, this.centerData.collectionMeetingCalendar.id, data).subscribe(() => {
      this.router.navigate(['../../'], { relativeTo: this.route });
    });
  }

}
