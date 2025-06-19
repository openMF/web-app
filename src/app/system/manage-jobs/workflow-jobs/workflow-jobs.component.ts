import { CdkDragDrop, moveItemInArray, CdkDropList, CdkDrag } from '@angular/cdk/drag-drop';
import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
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
import { TranslateService } from '@ngx-translate/core';
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';
import { FormDialogComponent } from 'app/shared/form-dialog/form-dialog.component';
import { FormfieldBase } from 'app/shared/form-dialog/formfield/model/formfield-base';
import { SelectBase } from 'app/shared/form-dialog/formfield/model/select-base';
import { SystemService } from 'app/system/system.service';
import { MatButton, MatIconButton } from '@angular/material/button';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatTooltip } from '@angular/material/tooltip';
import { WorkflowDiagramComponent } from './workflow-diagram/workflow-diagram.component';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

export interface JobStep {
  stepName: string;
  stepDescription: string;
  order: number;
}

@Component({
  selector: 'mifosx-workflow-jobs',
  templateUrl: './workflow-jobs.component.html',
  styleUrls: ['./workflow-jobs.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent,
    MatTable,
    CdkDropList,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    MatIconButton,
    MatTooltip,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    CdkDrag,
    WorkflowDiagramComponent
  ]
})
export class WorkflowJobsComponent implements OnInit {
  stepOrderHasChanged = false;

  jobNameOptions: any = [];
  jobStepsData: any = [];
  jobAvailableStepsData: JobStep[] = [];
  jobStepsDataBase: any = [];
  jobStepName: String = null;

  jobName = new UntypedFormControl('', Validators.required);

  @ViewChild('table') table: MatTable<JobStep>;

  /** Columns to be displayed in the table. */
  displayedColumns: string[] = [
    'stepName',
    'stepOrder',
    'actions'
  ];

  constructor(
    private systemService: SystemService,
    public dialog: MatDialog,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.systemService
      .getWorkflowJobNames()
      .toPromise()
      .then((jobNames) => {
        this.jobNameOptions = jobNames.businessJobs.sort(function (a: any, b: any) {
          return a.stepName - b.stepName;
        });
      });
  }

  /**
   * Get the Workflow Job steps data
   * @param {string} jobName Value to Workflow Job name.
   */
  getWorkflowJobSteps(jobName: string) {
    this.systemService.getWorkflowJobSteps(jobName).subscribe((data: any) => {
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
      data: { deleteContext: this.translateService.instant('labels.text.this') }
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

  /**
   * Add Job Step to Workflow
   */
  addJobStep() {
    if (this.jobStepName != null) {
      const jobDatas = this.jobStepName.split('_');
      this.jobAvailableStepsData = [];
      this.systemService
        .getAvailablesJobSteps(jobDatas[0])
        .toPromise()
        .then((jobData) => {
          this.jobAvailableStepsData = jobData.availableBusinessSteps.sort(function (a: any, b: any) {
            return a.stepName - b.stepName;
          });

          const tmpStepsNames: any = [];
          this.jobStepsData.forEach((step: any) => {
            return tmpStepsNames.push(step.stepName);
          });

          if (this.jobAvailableStepsData.length > 0) {
            this.jobAvailableStepsData = this.jobAvailableStepsData.filter((item: any) => {
              return tmpStepsNames.indexOf(item.stepName) < 0;
            });
          }

          if (this.jobAvailableStepsData.length > 0) {
            for (let index = 0; index < this.jobAvailableStepsData.length; index++) {
              this.jobAvailableStepsData[index].stepDescription = this.translateService.instant(
                `labels.catalogs.${this.jobAvailableStepsData[index].stepDescription}`
              );
            }
            const frmFields: FormfieldBase[] = [
              new SelectBase({
                controlName: 'stepName',
                label: this.translateService.instant('labels.text.Step'),
                options: { label: 'stepDescription', value: 'stepName', data: this.jobAvailableStepsData },
                order: 1
              })

            ];
            const data = {
              title: this.translateService.instant('labels.text.Add Job Step to Workflow'),
              layout: { addButtonText: 'Add' },
              formfields: frmFields
            };
            const stepDialogRef = this.dialog.open(FormDialogComponent, { data });
            stepDialogRef.afterClosed().subscribe((response: any) => {
              if (response.data) {
                this.jobStepsData = this.jobStepsData.concat(response.data.value);
                this.stepOrderHasChanged = true;
              }
            });
          }
        });
    }
  }

  saveChanges() {
    // Set the new Order
    let stepOrder = 1;
    this.jobStepsData.forEach((jobStep: JobStep) => {
      jobStep.order = stepOrder++;
    });

    const payload = {
      businessSteps: this.jobStepsData
    };

    this.systemService
      .putWorkflowJobSteps(this.jobStepName, payload)
      .toPromise()
      .then((data) => {
        this.stepOrderHasChanged = false;
      });
  }
}
