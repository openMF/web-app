import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTable } from '@angular/material/table';
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';
import { SystemService } from 'app/system/system.service';
import { JobStep } from './workflow-diagram/workflow-diagram.component';

@Component({
  selector: 'mifosx-workflow-jobs',
  templateUrl: './workflow-jobs.component.html',
  styleUrls: ['./workflow-jobs.component.scss']
})
export class WorkflowJobsComponent implements OnInit {
  stepOrderHasChanged = false;

  jobNameOptions: any = [];
  jobStepsData: any = [];
  jobStepsDataBase: any = [];
  jobStepName: String = null;

  jobName = new FormControl('', Validators.required);

  @ViewChild('table') table: MatTable<JobStep>;

  /** Columns to be displayed in the table. */
  displayedColumns: string[] = ['stepName', 'stepOrder', 'actions'];

  constructor(private systemService: SystemService,
    public dialog: MatDialog) {}

  ngOnInit(): void {
    this.systemService.getWorkflowJobNames().toPromise()
    .then(jobNames => {
      this.jobNameOptions = jobNames;
    });
  }

  /**
   * Get the Workflow Job steps data
   * @param {string} jobName Value to Workflow Job name.
   */
  getWorkflowJobSteps(jobName: string) {
    this.systemService.getWorkflowJobSteps(jobName).toPromise()
    .then(data => {
      this.jobStepName = jobName;
      this.jobStepsData = data.businessSteps.sort(function (a: JobStep, b: JobStep) {
        return a.order - b.order;
      });
      this.jobStepsDataBase = this.jobStepsData;
    });
  }

  dropTable(event: CdkDragDrop<JobStep[]>) {
    const prevIndex = this.jobStepsData.findIndex((d: JobStep) => d === event.item.data);
    moveItemInArray(this.jobStepsData, prevIndex, event.currentIndex);
    this.jobStepsData = [...this.jobStepsData];
    this.table.renderRows();
    this.stepOrderHasChanged = true;
  }

  /**
   * Delete particular Job Step from Workflow Job
   */
  removeJobStep(index: number) {
    const dialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `this` }
    });
    dialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.jobStepsData.splice(index, 1);
        this.jobStepsData = this.jobStepsData.concat([]);
        this.jobStepsData = [...this.jobStepsData];
        this.stepOrderHasChanged = true;
      }
    });
  }

  saveChanges() {
    // Set the new Order
    let stepOrder = 1;
    this.jobStepsData.forEach((jobStep: JobStep) => {
      jobStep.order = stepOrder++;
    });

    const payload = {
      'businessSteps': this.jobStepsData
    };

    this.systemService.putWorkflowJobSteps(this.jobStepName, payload).toPromise()
    .then(data => {
      this.stepOrderHasChanged = false;
    });
  }

}
