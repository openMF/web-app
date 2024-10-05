import { Component } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { SystemService } from '../system.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'mifosx-manage-jobs',
  templateUrl: './manage-jobs.component.html',
  styleUrls: ['./manage-jobs.component.scss']
})
export class ManageJobsComponent {
  /** Process running flag */
  isCatchUpRunning = true;

  constructor(private systemService: SystemService,
    private translateService: TranslateService) { }

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
