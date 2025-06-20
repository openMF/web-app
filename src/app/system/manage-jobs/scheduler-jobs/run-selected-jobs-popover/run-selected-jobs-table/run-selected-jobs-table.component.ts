import { Component, EventEmitter, Input, Output } from '@angular/core';
import { JobDataType } from '../run-selected-jobs-popover.component';
import {
  MatTable,
  MatColumnDef,
  MatHeaderCellDef,
  MatHeaderCell,
  MatCellDef,
  MatCell,
  MatHeaderRowDef,
  MatHeaderRow,
  MatRowDef,
  MatRow
} from '@angular/material/table';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Run Selected Jobs Table Component
 */
@Component({
  selector: 'mifosx-run-selected-jobs-table',
  templateUrl: './run-selected-jobs-table.component.html',
  styleUrls: ['./run-selected-jobs-table.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    MatIconButton,
    MatTooltip,
    FaIconComponent,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow
  ]
})
export class RunSelectedJobsTableComponent {
  /** Selected Jobs For Table */
  @Input() selectedJobs: JobDataType[] = [];

  /** Confirmed Jobs */
  @Output() confirmedJobs: EventEmitter<JobDataType[]> = new EventEmitter<JobDataType[]>();

  /** Columns for the table */
  columnsToDisplay: string[] = [
    'displayName',
    'actions'
  ];

  constructor() {}

  /**
   * Removes job from selection array
   * @param index
   */
  removeJobFromSelection(index: number): void {
    let idx = 0;
    const finalSelectedJobs: JobDataType[] = [];
    for (; idx < this.selectedJobs.length; idx++) {
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
