import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { JobIdAndParameterType, JobParameterType } from '../custom-parameters-popover.component';

@Component({
  selector: 'mifosx-custom-parameters-table',
  templateUrl: './custom-parameters-table.component.html',
  styleUrls: ['./custom-parameters-table.component.scss']
})
export class CustomParametersTableComponent implements OnInit {

  /* Job name for table title */
  @Input() displayName: string;
  /* Job id for table */
  @Input() jobId: string;
  /* Array of custom job parameters */
  @Input() jobParameters: JobParameterType[];
  /* Listener to return jobs */
  @Output() retrieveJob: EventEmitter<JobParameterType[]> = new EventEmitter<JobParameterType[]>();

  /* Job parameters copy updated by user input */
  updatedJobParameters: JobParameterType[];
  /* Columns for the table */
  columnsToDisplay: string[] = ['parameterName', 'parameterValue', 'actions'];

  constructor() { }

  ngOnInit(): void {
    this.updatedJobParameters = this.jobParameters;
    this.updatedJobParameters.push({
      parameterName: '',
      parameterValue: ''
    });
  }

  addParameter(): void {
    this.updatedJobParameters = [
      ...this.updatedJobParameters,
      {
        parameterName: '',
        parameterValue: ''
      }
    ];
  }

  deleteParameter(index: number): void {
    let idx = 0;
    const jobParameters: JobParameterType[] = [];
    for ( ; idx < this.updatedJobParameters.length; idx++ ) {
      if (idx !== index) {
        jobParameters.push(this.updatedJobParameters[idx]);
      }
    }
    this.updatedJobParameters = jobParameters;
  }

  /**
   * Gets the jobId and jobParameters array
   * @returns jobId and jobParameters array
   */
  getTableData(): JobIdAndParameterType {
    return {
      jobId: this.jobId,
      displayName: this.displayName,
      jobParameters: this.updatedJobParameters
    };
  }

}
