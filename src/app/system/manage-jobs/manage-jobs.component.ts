import { Component, OnInit } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { SystemService } from '../system.service';

@Component({
  selector: 'mifosx-manage-jobs',
  templateUrl: './manage-jobs.component.html',
  styleUrls: ['./manage-jobs.component.scss']
})
export class ManageJobsComponent implements OnInit {
  /** Process running flag */
  isCatchUpRunning = true;

  constructor(private systemService: SystemService) { }

  ngOnInit(): void {
  }

  onJobTabChange(event: MatTabChangeEvent) {
    if (event.index === 2) {
      this.systemService.getCOBCatchUpStatus().subscribe((response: any) => {
        this.isCatchUpRunning = response.isCatchUpRunning;
      });
    }
  }

}
