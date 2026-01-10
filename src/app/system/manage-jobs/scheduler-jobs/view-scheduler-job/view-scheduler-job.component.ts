/** Angular Imports */
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { YesnoPipe } from '../../../../pipes/yesno.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * View Scheduler Job component.
 */
@Component({
  selector: 'mifosx-view-scheduler-job',
  templateUrl: './view-scheduler-job.component.html',
  styleUrls: ['./view-scheduler-job.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent,
    YesnoPipe
  ]
})
export class ViewSchedulerJobComponent {
  private route = inject(ActivatedRoute);

  /** Job Data. */
  jobData: any;

  /**
   * Retrieves the selected job data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor() {
    this.route.data.subscribe((data: { selectedJob: any }) => {
      this.jobData = data.selectedJob;
    });
  }
}
