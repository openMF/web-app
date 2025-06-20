import { SelectionModel } from '@angular/cdk/collections';
import { Component, EventEmitter, Inject, OnInit, Output, QueryList, ViewChildren } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose
} from '@angular/material/dialog';
import { SystemService } from 'app/system/system.service';
import { RunSelectedJobsTableComponent } from './run-selected-jobs-table/run-selected-jobs-table.component';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatList, MatListItem } from '@angular/material/list';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

interface SelectedJobsDataType {
  selectedJobs: SelectionModel<JobDataType>;
}

export interface JobDataType {
  active: boolean;
  cronExpression: string;
  currentlyRunning: boolean;
  displayName: string;
  jobId: number;
  lastRunHistory: {
    jobRunEndTime: string;
    jobRunStartTime: string;
    status: string;
    triggerType: string;
    version: number;
  };
  nextRunTime: string;
}

@Component({
  selector: 'mifosx-run-selected-jobs-popover',
  templateUrl: './run-selected-jobs-popover.component.html',
  styleUrls: ['./run-selected-jobs-popover.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDialogTitle,
    CdkScrollable,
    MatDialogContent,
    RunSelectedJobsTableComponent,
    MatList,
    MatListItem,
    MatDialogActions,
    FaIconComponent,
    MatDialogClose
  ]
})
export class RunSelectedJobsPopoverComponent implements OnInit {
  /** Confirmed jobs event emitter */
  @Output() confirmedJobs = new EventEmitter<JobDataType[]>();

  /** Job table children */
  @ViewChildren(RunSelectedJobsTableComponent) tableComponents: QueryList<RunSelectedJobsTableComponent>;

  /** Initialize Selected Jobs */
  selectedJobs: JobDataType[] = [];

  /** Show modal or not */
  show: number;

  /** API call response message */
  messages: { message: string; status: number }[] = [];

  constructor(
    private systemService: SystemService,
    @Inject(MAT_DIALOG_DATA)
    public data: SelectedJobsDataType
  ) {}
  ngOnInit(): void {
    this.selectedJobs = this.data.selectedJobs.selected.sort((a, b) => a.jobId - b.jobId);
  }

  /**
   * Run all confirmed jobs from table
   */
  runSelectedJobs(): void {
    this.messages = [];
    let tableData: JobDataType[] = [];
    this.tableComponents.forEach((tableComponent) => {
      tableData = tableComponent.getTableData();
    });

    tableData.forEach((job) => {
      this.systemService.runSelectedJob(job.jobId.toString()).then((response) => {
        this.messages.push({
          message: `${job.displayName}: ${response.statusText} (${response.status})`,
          status: response.ok
        });
      });
    });

    this.confirmedJobs.emit(tableData);
  }
}
