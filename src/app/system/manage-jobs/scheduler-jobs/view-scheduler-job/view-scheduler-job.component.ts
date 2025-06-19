/** Angular Imports */
import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatCard, MatCardContent, MatCardActions } from '@angular/material/card';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { YesnoPipe } from '../../../../pipes/yesno.pipe';

/**
 * View Scheduler Job component.
 */
@Component({
  selector: 'mifosx-view-scheduler-job',
  templateUrl: './view-scheduler-job.component.html',
  styleUrls: ['./view-scheduler-job.component.scss'],
  imports: [
    MatButton,
    RouterLink,
    FaIconComponent,
    MatCard,
    MatCardContent,
    MatCardActions,
    YesnoPipe,
    NgxTranslatePipe
  ]
})
export class ViewSchedulerJobComponent {
  /** Job Data. */
  jobData: any;

  /**
   * Retrieves the selected job data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe((data: { selectedJob: any }) => {
      this.jobData = data.selectedJob;
    });
  }
}
