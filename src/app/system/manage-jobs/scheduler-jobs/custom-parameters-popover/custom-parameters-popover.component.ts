import { SelectionModel } from '@angular/cdk/collections';
import { Component, Inject, OnInit, QueryList, ViewChildren } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CustomParametersTableComponent } from './custom-parameters-table/custom-parameters-table.component';
import { SystemService } from 'app/system/system.service';

interface SelectedJobsDataType {
  selectedJobs: SelectionModel<JobDataType>;
  parameterValue: string;
}

export interface JobIdAndParameterType {
  jobId: string;
  displayName: string;
  jobParameters: JobParameterType[];
}

export interface RunJobWithParamPayloadType {
  jobParameters: JobParameterType[];
}

export interface JobParameterType {
  parameterName: string;
  parameterValue: string;
}

interface JobDataType {
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
  jobParameters: JobParameterType[];
}

@Component({
  selector: 'mifosx-custom-parameters-popover',
  templateUrl: './custom-parameters-popover.component.html',
  styleUrls: ['./custom-parameters-popover.component.scss']
})
export class CustomParametersPopoverComponent implements OnInit {

  /* Job table childer */
  @ViewChildren(CustomParametersTableComponent) tableComponents: QueryList<CustomParametersTableComponent>;

  /* Initialize Selected Jobs */
  selectedJobs: JobDataType[] = [];
  /* Show modal or not */
  show: number;
  /* API call response message */
  messages: { message: string; status: number }[] = [];

  constructor(private systemService: SystemService, @Inject(MAT_DIALOG_DATA) public data: SelectedJobsDataType) { }

  ngOnInit(): void {
    this.selectedJobs = this.data.selectedJobs.selected.map((jobJSON) => ({
      ...jobJSON,
      jobParameters: []
    }));
  }

  /**
   * Run all selected jobs with job parameters from table
   */
  runSelectedJobs(): void {
    this.messages = [];
    const tableData: JobIdAndParameterType[] = [];
    this.tableComponents.forEach((tableComponent) => {
      tableData.push(tableComponent.getTableData());
    });

    tableData.forEach((job) => {
      this.systemService.runSelectedJobWithParameters(job.jobId,
        { jobParameters: job.jobParameters }
      )
      .then((response) => {
        this.messages.push({
          message: `${job.displayName}: ${response.statusText} (${response.status})`,
          status: response.ok
        });
      });
    });
  }

}
