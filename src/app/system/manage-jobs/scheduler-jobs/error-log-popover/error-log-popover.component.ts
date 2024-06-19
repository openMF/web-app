import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { SchedulerJob } from '../models/scheduler-job.model';


interface ErrorJobDataType {
  job: SchedulerJob;
}

@Component({
  selector: 'mifosx-error-log-popover',
  templateUrl: './error-log-popover.component.html',
  styleUrls: ['./error-log-popover.component.scss']
})
export class ErrorLogPopoverComponent implements OnInit {
  show = false;

  /* Initialize Selected Job */
  job: SchedulerJob;

  constructor(@Inject(MAT_DIALOG_DATA) public data: ErrorJobDataType,
    private translateService: TranslateService) { }

  ngOnInit(): void {
    this.job = this.data.job;
  }

  buttonLabel(): string {
    const label: string = this.show ? this.translateService.instant('labels.buttons.Show less'): this.translateService.instant('labels.buttons.Show more');
    return this.translateService.instant('labels.buttons.' + label);
  }

}
