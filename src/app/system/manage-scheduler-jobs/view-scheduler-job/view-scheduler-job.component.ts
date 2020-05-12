/** Angular Imports */
import { Component} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

/**
 * View Scheduler Job component.
 */
@Component({
  selector: 'mifosx-view-scheduler-job',
  templateUrl: './view-scheduler-job.component.html',
  styleUrls: ['./view-scheduler-job.component.scss']
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
