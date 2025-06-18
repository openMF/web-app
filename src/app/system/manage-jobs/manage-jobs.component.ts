import { Component } from '@angular/core';
import { MatTabChangeEvent, MatTabGroup, MatTab } from '@angular/material/tabs';
import { SystemService } from '../system.service';
import { TranslateService } from '@ngx-translate/core';
import { MatCard, MatCardContent } from '@angular/material/card';
import { ManageSchedulerJobsComponent } from './scheduler-jobs/manage-scheduler-jobs.component';
import { WorkflowJobsComponent } from './workflow-jobs/workflow-jobs.component';
import { CobWorkflowComponent } from './cob-workflow/cob-workflow.component';

@Component({
  selector: 'mifosx-manage-jobs',
  templateUrl: './manage-jobs.component.html',
  styleUrls: ['./manage-jobs.component.scss'],
  imports: [
    MatCard,
    MatCardContent,
    MatTabGroup,
    MatTab,
    ManageSchedulerJobsComponent,
    WorkflowJobsComponent,
    CobWorkflowComponent
  ]
})
export class ManageJobsComponent {
  /** Process running flag */
  isCatchUpRunning = true;

  constructor(
    private systemService: SystemService,
    private translateService: TranslateService
  ) {}

  onJobTabChange(event: MatTabChangeEvent) {
    if (event.index === 2) {
      this.systemService.getCOBCatchUpStatus().subscribe((response: any) => {
        this.isCatchUpRunning = response.isCatchUpRunning;
      });
    }
  }

  title(label: string) {
    return this.translateService.instant('labels.inputs.' + label);
  }
}
