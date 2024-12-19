import { Component, EventEmitter, Input, Output } from '@angular/core';
import { JobDataType } from '../run-selected-jobs-popover.component';

/**
 * Run Selected Jobs Table Component
 */
@Component({
  selector: 'mifosx-run-selected-jobs-table',
  templateUrl: './run-selected-jobs-table.component.html',
  styleUrls: ['./run-selected-jobs-table.component.scss']
})
export class RunSelectedJobsTableComponent {

  /** Selected Jobs For Table */
  @Input() selectedJobs: JobDataType[];

  /** Confirmed Jobs */
  @Output() confirmedJobs: EventEmitter<JobDataType[]> = new
    EventEmitter<JobDataType[]>();

  /** Columns for the table */
  columnsToDisplay: string[] = ['displayName', 'actions'];

  constructor() {
  }

  /**
  * Removes job from selection array
  * @param index
  */
  removeJobFromSelection(index: number): void {
    let idx = 0;
    const finalSelectedJobs: JobDataType[] = [];
    for (; idx < this.selectedJobs.length; idx) {
      if (idx !== index) {
        finalSelectedJobs.push(this.selectedJobs[idx]);
      }
    }
    this.selectedJobs = finalSelectedJobs;
  }

  /**
  * Gets selected jobs array
  * @returns selected jobs array
  */
  getTableData(): JobDataType[] {
    return this.selectedJobs;
  }
}
